from get import *
import base64
import io
import matplotlib.pyplot as plt 
def graphData(timeframe, name, sensors, title = ""):
	colors = ["r", "b", "g", "c", "m", "y", "k"]
	data = get(timeframe)
	print(name)
	print(sensors)
	plt.figure()#sum(["qwertyuiopasdfghjklzxcvbnm.".index(x) for x in name]))
	c = 0
	for sensor in sensors:
		c = c + 1
		x = []
		y = []
		for row in data:
			if row[1] == sensor[0]:
				x += [row[0]]
				y += [row[3]]
		plt.plot(x, y, colors[c % len(colors)])

	plt.title(title)
	plt.xlabel(timeframe)
	plt.ylabel("PM_2.5 Readings")
	plt.legend([s[1] for s in sensors])

	buffer = io.BytesIO()
	plt.savefig(buffer, format='png')
	plt.close()

	buffer.seek(0)
	graph = base64.b64encode(buffer.read()).decode('utf-8')
	return graph

#graphData("1 week", "test1.png", [[128729, "Uxbridge"]], "Uxbridge")

#graphData("3 days", "test1D.png", [[128729, "Uxbridge"]], "Uxbridge")

#graphData("1 week", "test2.png", [[222275, "Mendon St."]], "Mendon St.")

#graphData("3 days", "test2D.png", [[222275, "Mendon St."]], "Mendon St.")

#graphData("1 week", "test3.png", [[222537, "Coach Rd. Appts."]], "Coach Rd. Appts.")

#graphData("1 week", "test23.png", [[222275, "Mendon St."], [222537, "Coach Rd. Appts."]], "Mendon St. & Coach Rd. Appts.")