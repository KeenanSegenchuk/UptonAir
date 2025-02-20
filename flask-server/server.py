# This is our backend file
import matplotlib
matplotlib.use('Agg')
from flask import Flask, Blueprint, request
from flask_cors import CORS
from clean import *
from get import *
from getMapInfo import *
from graphData import *
from getWAV import *
from getSensorInfo import *
from getByDate import *
import matplotlib.pyplot as plt 
import json
import os
from numpy import linspace
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Members API Route
@app.route("/members")
def members():
	return {"members":["Syed Shazli is a Computer Science Major at Worcester Polytechnic Institute", "Keenan Segenchuck is a recent Computer Science graduate at Worcester Polytechnic Institute", "Peter Friedland is a passionate environmental activist with extensive experience in Air Quality. He runs the brains of the operation along with Laurie.", "Laurie Woodland is a passionate environmental activist with extensive experience in Air Quality. She runs the brains of the operation along with Peter."]}

# API ROUTES
aqi_bp = Blueprint('aqi', __name__, url_prefix='/api/aqi')
raw_bp = Blueprint('raw', __name__, url_prefix='/api/raw')
sensor_info_bp = Blueprint('sensor_info', __name__, url_prefix='/api/sensor_info')


@app.route("/api/data")
def raw_data():
	with open("data.txt", "r") as data:
		return data.read()

# WAVEFORM
@app.route("/api/wav/<string:query>")
def wav(query):
	# Get raw amplitude with fixed sampling frequency
	# Options to fill in missing data should be zeroing or smoothing
	# Query is used to set constants and should be in the form <code>:<value>,<code>:<value> etc...	
	query = [pair.split(":") for pair in query.split(",")]

	# Downsample to lambda second intervals of recording for uniform sampling rate
	labda = 60*60    #code: &l
	l = [pair for pair in query if pair[0] == "&l"]
	if len(l) == 1:
		labda = l[0][1]	

	# Fill in missing data by zeroing or smoothing
	zero = False #code: &z, valid values: 0 or 1
	z = [pair for pair in query if pair[0] == "&z"]
	if len(z) == 1:
		zero = z[0][1]	

	# Average sensors together, or make seperate vector?
	combine = True #code: &c
	c = [pair for pair in query if pair[0] == "&c"]
	if len(c) == 1:
		combine = c[0][1]	
	
	# Sensors IDs to include in the waveform 
	sensors = [int(pair[1]) for pair in query if pair[0] == "&i"] #code: &i, make a new <code>,<value> pair for each sensor you want to include

	# Whether you want AQI or PM2.5 values
	aqi = [int(pair[1]) for pair in query if pair[0] == "&a"] #code: &a, make a new <code>,<value> pair for each sensor you want to include
	
	# Start Time
	start = 0 #code: &s
	s = [pair for pair in query if pair[0] == "&s"]
	if len(s) == 1:
		start = int(s[0][1])	

	# End Time
	end = float("Inf") #code: &e
	e = [pair for pair in query if pair[0] == "&e"]
	if len(e) == 1:
		end = int(e[0][1])	

	waveform = getWAV(sensors, start, end, labda, zero, combine)	
	return waveform

# AQI
@aqi_bp.route("/avg/<string:timespan>")
def avg_aqi(timespan):
	print("Avg AQI Request") 
	data = get(timespan)

	with open("sensor-pos.json", "r") as json_file:
		sensors = json.load(json_file)
	for sensor in sensors:
		id = int(sensor['id'])
		sdata = [(float(x[7]) + float(x[6])) / 2 for x in data if int(x[1]) == id]
		if len(sdata) > 0:
			sensor['avg'] = sum(sdata)/len(sdata)

	return json.dumps(sensors, indent=4)

@aqi_bp.route("/<int:sensor_id>")
def aqi(sensor_id):
	end = datetime().timestamp()
	start = end - (60*60*24*7)

	data = getByDate(sensor_id, start, end)
	data = [(float(x[7]) + float(x[6])) / 2 for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

@aqi_bp.route("/<int:start>-<int:end>/<int:sensor_id>")
def aqi2(start, end, sensor_id):
	data = getByDate(sensor_id, start, end)
	data = [(float(x[7]) + float(x[6])) / 2 for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

@aqi_bp.route("/time/<int:start>-<int:end>/<int:sensor_id>")
def aqi3(start, end, sensor_id):
	def avgAllSensors(data):
		newdata = []
		time = 0
		total = 0
		count = 0
		for entry in data:
			if time != entry[0]:
				time = entry[0]
				if count != 0:
					newdata += [[int(time), total/count]]
			total += (float(entry[7]) + int(entry[6])) / 2
			count += 1
		if count != 0:
			newdata += [[int(time), total/count]]
		return newdata

	if sensor_id == 0:
		with open("sensor-pos.json") as sensorfile:
			sensors = json.load(sensorfile)
			sensors = [s["id"] for s in sensors]
		data = getByDate(sensors, start, end)
		data = avgAllSensors(data)
	else:
		data = getByDate(sensor_id, start, end)
		data = [[float(x[0]), (float(x[7]) + float(x[6])) / 2] for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

# Register Blueprint
app.register_blueprint(aqi_bp)

# RAW
@raw_bp.route("/<int:sensor_id>")
def raw(sensor_id):
	end = datetime().timestamp()
	start = end - (60*60*24*7)

	data = getByDate(sensor_id, start, end)
	data = {"data": data}

	return json.dumps(data, indent=4)

raw_bp.route("/<int:start>-<int:end>/<int:sensor_id>")
def raw2(start, end, sensor_id):
	data = getByDate(sensor_id, start, end)
	data = {"data": data}

	return json.dumps(data, indent=4)

# Register Blueprint
app.register_blueprint(raw_bp)

@app.route("/sensorinfo", methods =["GET"])
def sensorinfo():
	with open("sensor-pos.json", "r") as sensors:
		sensors = json.load(sensors)
		sensor = [request.args.get("sensor"), sensors[[s["id"] for s in sensors].index(request.args.get("sensor"))]["name"]]
	print(sensor[0])
	info = getSensorInfo(sensor[0])
	print(info)
	info = json.loads(info)
	info["name"] = str(sensor[1])
	info["graph"] = graphData("1 week", "homeplot.jpg", [sensor] , str(sensor[1]) + "'s readings from the past week.")
	return json.dumps(info, indent=4)

@sensor_info_bp.route("/<int:start>-<int:end>/<int:sensor_id>", methods =["GET"])
def sensorinfo(sensor_id, start, end):
	with open("sensor-pos.json", "r") as sensors:
		sensors = json.load(sensors)
		sensor = [sensor_id, sensors[[s["id"] for s in sensors].index(sensor_id)]["name"]]
	
	data = getByDate(sensor_id, start, end)
	averages = ["1 month","1 week", "1 day", "3 hour"]
	times = []

	response = {
		"id": sensor[0],
		"name": sensor[1],
		"avgs": avgs,
		"inputs": averages,
	}
	print(json.dumps(data, indent=4))

@app.route("/map", methods =["GET"])
def map():
	return getMapInfo()

@app.route("/p", methods =['POST', 'GET'])
def p():
	with open("pull.py") as pull:
		exec(pull.read())

@app.route("/c", methods =['POST', 'GET'])
def c():
	clean()

    

if __name__ == "__main__":
	app.run(debug=True)