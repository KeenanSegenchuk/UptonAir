# This is our backend file
import asyncio
from flask import Flask, Blueprint, request, send_from_directory, jsonify, make_response
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
alert_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts') #API for submitting and withdrawing emails/phone #s from alerts system
aqi_bp = Blueprint('aqi', __name__, url_prefix='/api/aqi') #API for pulling AQI readings
raw_bp = Blueprint('raw', __name__, url_prefix='/api/raw') #API for pulling raw data
sensor_info_bp = Blueprint('sensorinfo', __name__, url_prefix='/api/sensorinfo') #API for preformated sensorinfo JSON

# PULL ARCHIVE
@app.route("/api/data")
def raw_data():
	with open(datafile, "r") as data:
		return data.read()

# ALERTS
# Add new email alert to database
@alert_bp.route("add/<string:address>/<string:name>/<int:min_AQI>/<string:ids>/<int:cooldown>/<int:avg_window>")
def add_alert(address, name, min_AQI, ids, cooldown, avg_window):
	if ids == "All":
		ids = [id for id in getSensors() if id != 0]
	else:
		ids = [int(id) for id in ids.split(",")]
	DATA_ROW = (address, name, min_AQI, ids, cooldown, avg_window, 0, 0) #a row of data has this format, the last entries are the last time an alert has been issued to the given contact address, and how many times this alert has been triggered
	
	conn, cur = pgOpen()
	
	#check for table
	if not pgCheck(cur, "alerts"):
		print("WARNING: Alert table not found when trying to add alert.")
	
	response = pgPushAddress(cur, DATA_ROW)
	#commit new entry to table
	conn.commit()
	pgClose(conn, cur)

	responses = [
		(jsonify(message="Email alert pushed to database."), 200),
		(jsonify(error="Could not add the alert since name is not unique."), 400),
		(jsonify(error="Unknown Error."), 500)
	]
	return responses[response]

# Remove address from db
@alert_bp.route("remove/<string:address>/<string:name>")
def remove_alert(address, name):
	#check for table
	conn, cur = pgOpen()
	if not pgCheck(cur, table):
		print("WARNING: Alert table not found when trying to add alert.")

	response = pgRemoveAddress(cur, address, name)
	pgClose(conn, cur)
	responses = [
		(jsonify(message="Email alert removed database."), 200),
		(jsonify(error="Could not find an alert with given email and name."), 400),
		(jsonify(error="Unknown Error."), 500)
	]
	return responses[response]

app.register_blueprint(alert_bp)

# AQI

# Average the AQI of all sensors for given timespan
@aqi_bp.route("/avg/<int:start>-<int:end>")
def avg_aqi(start, end):
	print(f"Avg AQI from {start} to {end} Requested...")
	sensors = getSensors()

	#connect to postgres database
	conn, cur = pgOpen()
	response = []
	#get avg for each sensor
	for sensor in sensors:
		pgQuery(cur, start, end, sensor, col = "AVG(AQIEPA)")
		data = cur.fetchone()
		try:
			response += [{"avg": float(sum(data)/len(data)), "id": sensor}]
		except:
			print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	print(f"api/avg/ outgoing response: {response}")
	return json.dumps(response, indent=4)

# Average the AQI of given sensor for given timespan
@aqi_bp.route("/avg/<int:start>-<int:end>/<int:sensor_id>")
def avg_aqi2(start, end, sensor_id):
	print(f"Avg AQI from {start} to {end} Requested for Sensor {sensor_id}...")
	res = -1

	#connect to postgres database
	conn, cur = pgOpen()
	pgQueryAvg(cur, start, end, sensor_id, col = "AQIEPA")
	data = cur.fetchone()
	try:
		res = float(data[0])
	except:
		print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	print(f"api/avg/ outgoing response: {res}")
	return json.dumps(res, indent=4)

#pull time, aqi data for given timespan and sensor for plotting
@aqi_bp.route("/time/<int:start>-<int:end>/<int:sensor_id>")
def aqi3(start, end, sensor_id):
	conn, cur = pgOpen()
	if sensor_id == 0:
		pgQuery(cur, start, end, sensor_id, "time, AVG(AQIEPA) AS average_AQI")
		data = cur.fetchall()
	else:
		pgQuery(cur, start, end, sensor_id, "time, AVG(AQIEPA)")
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
	averages = ["6 months", "30 days", "1 week", "24 hours", "1 hour"]
	hour = 60 * 60
	day = 24 * hour
	end = datetime.now().timestamp()
	starts = [end - day*180, end - day * 30, end - day * 7, end - day * 1, end - hour]
	
	conn, cur = pgOpen()
	avgs = [-1 for avg in averages]

	for i, start in enumerate(starts):
		timespan = averages[i]
		#print(f"\Timespan: {timespan} — {datetime.fromtimestamp(start)} to {datetime.fromtimestamp(end)}")

		pgQueryAvg(cur, start, end, sensor_id, "AQIEPA")
		res = cur.fetchall()
		print(f"Response: {res}")
		avgs[i] = int(res[0][0])

	pgClose(conn, cur)

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": averages,
		"banner_avg": avgs[-1]
	}
	print(f"\n✅ /api/sensorinfo outgoing response: {json.dumps(response, indent=4)}")
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
@app.route('/static/<path:path>')
def serve_react_app(path):
    print("serving web build...")
    print(f"path: {path}")
    if path.startswith("static/"):
        return send_from_directory(app.static_folder, path[len("static/"):])
    return send_from_directory(app.static_folder, 'index.html')

# Since updateTask is moved to it's own image for production launch, 
# when when launching dev server, I now use "/update" to trigger a database update
@app.route('/update')
def update():
	if debug:
		print("Update API called. This should not be in the production build.")
		update_loop()
		return ""
	return ""

#test()

if __name__ == "__main__":
	#Development server:
	app.run(debug=True)
