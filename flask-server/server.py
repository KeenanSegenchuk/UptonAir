# This is our backend file
import matplotlib
matplotlib.use('Agg')
from flask import Flask, Blueprint, request
from flask_cors import CORS
from clean import *
from get import *
from getMapInfo import *
from graphData import *
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

# AQI
@aqi_bp.route("/avg/<string:timespan>")
def avg_aqi(timespan):
	data = get(timespan)

	with open("sensor-pos.json", "r") as json_file:
		sensors = json.load(json_file)
	for sensor in sensors:
		id = int(sensor['id'])
		sdata = [x[6] for x in data if int(x[1]) == id]
		if len(sdata) > 0:
			sensor['avg'] = sum(sdata)/len(sdata)

	return json.dumps(sensors, indent=4)

@aqi_bp.route("/<int:sensor_id>")
def aqi(sensor_id):
	end = datetime().timestamp()
	start = end - (60*60*24*7)

	data = getByDate(sensor_id, start, end)
	data = [float(x[6]) for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

@aqi_bp.route("/<int:start>-<int:end>/<int:sensor_id>")
def aqi2(start, end, sensor_id):
	data = getByDate(sensor_id, start, end)
	data = [float(x[6]) for x in data]
	data = {"data": data}

	return json.dumps(data, indent=4)

@aqi_bp.route("/time/<int:start>-<int:end>/<int:sensor_id>")
def aqi3(start, end, sensor_id):
	data = getByDate(sensor_id, start, end)
	data = [[float(x[0]), float(x[6])] for x in data]
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
	info = getSensorInfo(sensor[0])
	info = json.loads(info)
	info["name"] = str(sensor[1])
	info["graph"] = graphData("1 week", "homeplot.jpg", [sensor] , str(sensor[1]) + "'s readings from the past week.")
	return json.dumps(info, indent=4)

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