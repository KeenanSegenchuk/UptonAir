# This is our backend file
import matplotlib
matplotlib.use('Agg')
from flask import Flask, render_template, request
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

qrl = "quality.html"
frl = ""

# Members API Route
@app.route("/members")
def members():
	return {"members":["Syed Shazli is a Computer Science Major at Worcester Polytechnic Institute", "Keenan Segenchuck is a recent Computer Science graduate at Worcester Polytechnic Institute", "Peter Friedland is a passionate environmental activist with extensive experience in Air Quality. He runs the brains of the operation along with Laurie.", "Laurie Woodland is a passionate environmental activist with extensive experience in Air Quality. She runs the brains of the operation along with Peter."]}

@app.route("/quality", methods =['POST', 'GET'])
def quality():
	return render_template(qrl)

@app.route("/")
def home():
	return render_template(qrl)

@app.route("/raw", methods =["GET"])
def raw():
	sensor_id = request.args.get("sensor")
	start = request.args.get("start")
	end = request.args.get("end")

	with open("data\sensor-pos.json", "r") as sensors:
		sensors = json.load(sensors)
	title = sensors[[s["id"] for s in sensors].index(sensor_id)]["name"]
	
	#convert to seconds
	if type(start) == str and not start.isalnum():
		start = [int(x) for x in start.split("/")]
		end = [int(x) for x in end.split("/")]
		start = datetime(start[2], start[0], start[1]).timestamp()
		end = datetime(end[2], end[0], end[1]).timestamp()
	#get date range and convert to string dates
	print(start)
	print(end)
	dates = linspace(int(start), int(end), 7)
	dates = [datetime.fromtimestamp(x).strftime("%B %d, %I:%M") for x in dates] #%A, 

	data = getByDate(sensor_id, int(start), int(end))
	data = [(float(x[3])+float(x[4]))/2 for x in data]
	data = {"data": data, "dates": dates, "title": title}

	return json.dumps(data, indent=4)
	

@app.route("/get_plot", methods =['GET'])
def get_plot():
	return 0

@app.route("/sensorinfo", methods =["GET"])
def sensorinfo():
	with open("data\sensor-pos.json", "r") as sensors:
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
	print("here")
	with open("pull.py") as pull:
		exec(pull.read())
		clean()
	return render_template(qrl, updated = "True")
@app.route("/c", methods =['POST', 'GET'])
def c():
	clean()
	return render_template(qrl, updated = "True")

    

if __name__ == "__main__":
	app.run(debug=True)