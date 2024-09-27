# This is our backend file
import matplotlib
matplotlib.use('Agg')
from flask import Flask, render_template, request
from flask_cors import CORS
from clean import *
from get import *
from getMapInfo import *
from getSensorInfo import *
import matplotlib.pyplot as plt 

app = Flask(__name__)
CORS(app)

qrl = "quality.html"
frl = ""

# Members API Route
@app.route("/members")
def members():
	return {"members":["Syed", "Keenan", "Peter", "Laurie"]}

@app.route("/quality", methods =['POST', 'GET'])
def quality():
	return render_template(qrl)

@app.route("/")
def home():
	return render_template(qrl)

@app.route("/get_plot", methods =['POST', 'GET'])
def get_plot():
	if request.method == "POST":
		timeframes = request.form['window'].split(",")
		
		#get sensor id
		sensor = request.form['sensor']
		with open("sensors.txt") as sensors:
			s = sensors.read().splitlines()
			for ss in s:
				ss = ss.split(",")
				if ss[0] == sensor:
					sensor = float(ss[1])
		print(sensor)

		plots = []
		count = 0
		for timeframe in timeframes:
			data = get(timeframe)
			x = []
			y = []
			for row in data:
				print(row[1])
				if row[1] == sensor:
					x += [row[0]]
					y += [row[3]]
			print(f'PLOTTING DATA: \n X: {x} \n Y: {y}')
			plt.figure(count).clear()
			plt.plot(x, y)
			plt.title("Air quality over past " + timeframe)
			plt.xlabel(timeframe)
			plt.ylabel("PM_2.5 Readings")

			plt.savefig("static/aq_plot" + str(count) + ".png")
			plots.append("static/aq_plot" + str(count) + ".png")
			count = count + 1
		print(plots)
		html = render_template(qrl, plot_url = plots, frl = frl)
		print(html)
		return render_template(qrl, plot_url = plots, frl = frl)
	else:
		return render_template(qrl)

@app.route("/sensorinfo", methods =["GET"])
def sensorinfo():
	info = getSensorInfo(request.args.get("sensor"))
	print(info)
	return info

@app.route("/map", methods =["GET"])
def map():
	return getMapInfo()


@app.route("/p", methods =['POST', 'GET'])
def p():
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