# This is our backend file
import matplotlib
matplotlib.use('Agg')
from flask import Flask, render_template, request
from clean import *
from get import *
import matplotlib.pyplot as plt 
app = Flask(__name__)

qrl = "quality.html"
frl = "Z:/Projects/UptonAir/flask-server/"

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
		plots = []

		count = 0
		for timeframe in timeframes:
			data = get(timeframe)
			x = [row[0] for row in data]
			y = [row[3] for row in data]
			#print(f'PLOTTING DATA: \n X: {x} \n Y: {y}')
			plt.plot(x, y)
			plt.title("Air quality over past " + timeframe)
			plt.xlabel(timeframe)
			plt.ylabel("PM_2.5 Readings")

			plt.savefig("figs/aq_plot" + str(count) + ".png")
			plots.append("figs/aq_plot" + str(count) + ".png")
			count = count + 1
		print(plots)
		html = render_template(qrl, plot_url = plots, frl = frl)
		print(html)
		return render_template(qrl, plot_url = plots, frl = frl)
	else:
		return render_template(qrl)

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