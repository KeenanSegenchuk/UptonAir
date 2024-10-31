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
import matplotlib.pyplot as plt 
import json
import os

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

@app.route("/get_plot", methods =['GET'])
def get_plot():
	return 0

@app.route("/sensorinfo", methods =["GET"])
def sensorinfo():
	with open("data\sensor-pos.json", "r") as sensors:
		sensors = json.load(sensors)
		sensor = [request.args.get("sensor"), sensors[[s["id"] for s in sensors].index(request.args.get("sensor"))]["name"]]
	info = getSensorInfo(sensor[0])
	graphData("1 week", "homeplot.jpg", [sensor])
	info = json.loads(info)
	info["name"] = str(sensor[1])
	info["graphTitle"] = str(sensor[1]) + "'s readings from the past week."
	info["graphURL"] = "../public/plots/homeplot.jpg"
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