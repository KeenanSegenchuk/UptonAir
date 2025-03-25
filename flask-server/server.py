# This is our backend file
import matplotlib
import asyncio
matplotlib.use('Agg')
from flask import Flask, Blueprint, request
from flask_cors import CORS
#from clean import *
from pullfn import *
#from get import *
from fileUtil import getSensors, getLastTimestamp
from getByDate import *
import matplotlib.pyplot as plt 
import json
import os
import threading
from numpy import linspace
from datetime import datetime

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
app.register_blueprint(alert_bp)

# AQI
update_lock = threading.Lock()
def acquire_lock():
    update_lock.acquire()
def release_lock():
    update_lock.release()

#update data if out of date
@aqi_bp.before_request
async def check_data():
	#pull new data if none within past half hour
	rn = datetime.now().timestamp()
	half_hour_ago = rn - 60*30
	
	await asyncio.to_thread(acquire_lock)

	last_sample = getLastTimestamp()
	if last_sample < half_hour_ago:
		await update()

	release_lock()	

# Average the AQI of all sensors in for given timespan
@aqi_bp.route("/avg/<int:start>-<int:end>")
def avg_aqi(start, end):
	print(f"Avg AQI from {start} to {end} Requested...")
	sensors = getSensors()
	
	response = []
	for sensor in sensors:
		data = getByDate(sensor,start,end)
		data = [int(x[7]) for x in data]
		if len(data) > 0:
			response += [{'avg': sum(data)/len(data), 'id': sensor}]

	return json.dumps(response, indent=4)

#pull time, aqi data for given timespan and sensor for plotting
@aqi_bp.route("/time/<int:start>-<int:end>/<int:sensor_id>")
def aqi3(start, end, sensor_id):
	def avgAllSensors(data):
		newdata = []
		time = 0
		total = 0
		count = 0
		for entry in data:
			if time != entry[0]:
				if count != 0:
					newdata += [[int(time), total/count]]
				time = entry[0]
				total = 0
				count = 0
			total += int(entry[7])
			count += 1
		if count != 0:
			newdata += [[int(time), total/count]]
		return newdata

	if sensor_id == 0:
		sensors = getSensors()
		data = getByDate(sensors, start, end)
		data = avgAllSensors(data)
	else:
		data = getByDate(sensor_id, start, end)
		data = [[float(x[0]), int(x[7])] for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

#Get aqi averages for each sensor for past x days/hours
@aqi_bp.route("/sensorinfo/<int:sensor_id>")
def sensorinfo(sensor_id):
	if sensor_id == 0:
		sensors = getSensors()
	
	averages = ["30 days","7 days", "1 day", "6 hours"]
	hour = 60*60
	day = 24*hour
	end = datetime.now().timestamp()
	starts = [end-day*30, end-day*7, end-day, end-6*hour, end-hour]
	if sensor_id == 0:
		data = getByDate(sensors, starts[0], end)
	else:
		data = getByDate(sensor_id, starts[0], end)

	counts = [0]*len(starts)
	totals = [0]*len(starts)
	for line in data:
		time = int(line[0])
		aqi = int(line[7])
		#add aqi to avg for time range(s) that contain it
		for i in range(len(starts)):
			if time >= starts[i]:
				counts[i] += 1
				totals[i] += aqi
	avgs = [totals[i]/counts[i] if counts[i] > 0 else -1 for i in range(len(starts))]		

	if avgs[-1] == -1:
		update()

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": averages,
		"banner_avg": avgs[-1]
	}
	print(json.dumps(response, indent=4))
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

#pull data from purpleair to update archive
app.config["updating"] = False
async def update():
	print("Updating Archive...")
	if app.config["updating"]:
		print("Already Updating.")
		return
	app.config["updating"] = True
	cutoff = await pullfn()
	print(f"About to clean after cutoff: {cutoff-60*10}")
	cleanfn(datafile, cutoff-60*10)
	app.config["updating"] = False
	print("Finished Updating.")

print("Updating data...")
asyncio.run(update())    

if __name__ == "__main__":
	app.run(debug=True)