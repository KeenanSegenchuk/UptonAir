# This is our backend file
import asyncio
from flask import Flask, Blueprint, request, send_from_directory
from flask_cors import CORS
from pullfn import *
from fileUtil import getSensors, getLastTimestamp
from getByDate import *
import json
import os
import threading
from datetime import datetime
from pgUtil import *
from updateTask import update_loop

app = Flask(__name__)
CORS(app)
datafile = "data.txt"

# Members API Route
@app.route("/members")
def members():
	return {"members":["Syed Shazli is a Computer Science Major at Worcester Polytechnic Institute", "Keenan Segenchuck is a recent Computer Science graduate at Worcester Polytechnic Institute", "Peter Friedland is a passionate environmental activist with extensive experience in Air Quality. He runs the brains of the operation along with Laurie.", "Laurie Woodland is a passionate environmental activist with extensive experience in Air Quality. She runs the brains of the operation along with Peter."]}

# API ROUTES
alert_bp = Blueprint('alerts', __name__, url_prefix='/alerts') #API for submitting and withdrawing emails/phone #s from alerts system
aqi_bp = Blueprint('aqi', __name__, url_prefix='/api/aqi') #API for pulling AQI readings
raw_bp = Blueprint('raw', __name__, url_prefix='/api/raw') #API for pulling raw data
sensor_info_bp = Blueprint('sensorinfo', __name__, url_prefix='/api/sensorinfo') #API for preformated sensorinfo JSON

# PULL ARCHIVE
@app.route("/api/data")
def raw_data():
	with open(datafile, "r") as data:
		return data.read()

# ALERTS
@alert_bp.route("/<string:media>/<string:action>/<string:address>", methods=["POST"])
def handle_contact_info(media, action, address):
	#media specifices whether this contact info is your "phone" or "email", 
	#action specifies whether you wanna add or remove that phone/email from the list,
	#address is the email address or phone number
	efile = "alerts/mailing list.txt"
	pfile = "alerts/phone list.txt"
	file = efile if media == "email" else pfile

	with open(file, "r") as f:
		list = f.read().splitlines()

	if action == "add":
		if address in list:
			return "Entry already in list."
		with open(file, "a") as f:
			f.write(address + "\n")
	if action == "remove":	
		oldlen = len(list)	
		list = [entry for entry in list if entry != address]
		newlen = len(list)
		list = "\n".join(list) + "\n"	
	
		with open(file, "w") as f:
			f.write(list)
		if oldlen == newlen:
			return f"Contact info not found in {media} list." 
	return "Success updating contact info."

@alert_bp.route("add/<string:address>/<int:min_AQI>/", methods=["POST"])
def add_alert(address, min_AQI):
	#action specifies whether you wanna add or remove that phone/email from the list,
	#address is the email address or phone number
	#min_AQI is the minimum aqi to trigger an alert
	table = "alerts"
	DATA_ROW = (address, min_AQI, 0) #a row of data has this format, the last entry is the last time an alert has been issued to the given contact address
	conn, cur = pgOpen()
	if pgCheck(cur, table):
		print("Found alerts table...")
	else:
		pgBuildAlertsTable(cur)
		print("Built new Alerts table because none was found...")
	pgPushAddress(cur, DATA_ROW)
	pgClose(conn, cur)

@alert_bp.route("remove/<string:address>/", methods=["POST"])
def remove_alert(address):
	#action specifies whether you wanna add or remove that phone/email from the list,
	#address is the email address or phone number
	#min_AQI is the minimum aqi to trigger an alert
	table = "alerts"
	conn, cur = pgOpen()
	if pgCheck(cur, table):
		print("Found alerts table...")
	else:
		print("Could not find table to remove address from.")

	pgRemoveAddress(cur, address)
	pgClose(conn, cur)

app.register_blueprint(alert_bp)

# AQI

# Average the AQI of all sensors in for given timespan
@aqi_bp.route("/avg/<int:start>-<int:end>")
def avg_aqi(start, end):
	print(f"Avg AQI from {start} to {end} Requested...")
	sensors = getSensors()

	#connect to postgres database
	conn, cur = pgOpen()
	response = []
	#get avg for each sensor
	for sensor in sensors:
		pgQuery(cur, start, end, sensor, col = "AQI")
		data = cur.fetchone()
		try:
			response += [{"avg": sum(data)/len(data), "id": sensor}]
		except:
			print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	print(f"outgoing response: {response}")
	return json.dumps(response, indent=4)

#pull time, aqi data for given timespan and sensor for plotting
@aqi_bp.route("/time/<int:start>-<int:end>/<int:sensor_id>")
def aqi3(start, end, sensor_id):
	conn, cur = pgOpen()
	if sensor_id == 0:
		pgQuery(cur, start, end, sensor_id, "time, AVG(AQI) AS average_AQI")
		data = cur.fetchall()
	else:
		pgQuery(cur, start, end, sensor_id, "time, AQI")
		data = cur.fetchall()

	#type and sort(?) unsorted pg data	
	data = [[row[0], int(row[1])] for row in data]
	#data.sort(key= lambda x: (x[0], x[1]))

	#package data
	data = {"data": data}
	pgClose(conn, cur) 

	return json.dumps(data, indent=4)

#Get aqi averages for each sensor for past x days/hours
@aqi_bp.route("/sensorinfo/<int:sensor_id>")
def sensorinfo(sensor_id):	
	averages = ["30 days","7 days", "1 day", "6 hours", "1 hour"]
	hour = 60*60
	day = 24*hour
	end = datetime.now().timestamp()
	starts = [end-day*30, end-day*7, end-day, end-6*hour, end-hour]
	
	conn, cur = pgOpen()
	avgs = []		
	for i, start in enumerate(starts):
		if sensor_id == 0:
			pgQuery(cur, start, end, sensor_id, col = "AVG(AQI)")
		else:
			pgQuery(cur, start, end, sensor_id, col = "AQI")
		avg = cur.fetchone()
		if avg:
			avgs += [avg] 
		else:
			avgs += [-1]
			print(f"No samples from sensor {sensor_id} in the past {averages[i]}.")
	pgClose(conn, cur)

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": averages,
		"banner_avg": avgs[-1]
	}
	#print(json.dumps(response, indent=4))
	return response

# Register Blueprint
app.register_blueprint(aqi_bp)

# RAW
#Pull raw data from given timespan and sensor
raw_bp.route("/<int:start>-<int:end>/<int:sensor_id>")
def raw2(start, end, sensor_id):
	data = getByDate(sensor_id, start, end)
	data = {"data": data}

	return json.dumps(data, indent=4)

# Register Blueprint
app.register_blueprint(raw_bp)

def test():
	with open('tests.py') as f:
		exec(f.read())

# Catch all non-API routes and serve index.html
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Since updateTask is moved to it's own image for production launch, 
# when when launching dev server, I now use "/update" to trigger a database update
@app.route('/update')
def update():
	print("Update API called. This should not be in the production build.")
	update_loop()
	return ""


#test()

if __name__ == "__main__":
	#Development server:
	app.run(debug=False)
