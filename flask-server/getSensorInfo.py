import json

def find(T, data):
		t = int(data[len(data)-1].split(",")[0])
		T = t - T
		
		top = len(data) - 1
		bottom = 0
		while T != t:
			t = int(data[int((top+bottom)/2)].split(",")[0])
			#print(f'sample time: {t}, looking for {T}.')
			if T > t:
				bottom = int((top+bottom)/2 + 1)
			elif T < t:
				top = int((top+bottom)/2 - 1)
			if abs(top - bottom) <= 1:
				return bottom;
		return int((top+bottom)/2)

def getSensorInfo(sensor):
	averages = ["6 Hour", "1 Day", "1 Week", "1 Month"]
	file = open("data.txt")
	data = file.read().splitlines()[1:]
	avgs = []

	for t in averages:
		t = t.split(" ")
		num = int(t[0])
		if t[1] == "Month": 
			num = num * 30 * 24 * 60 * 60
		elif t[1] == "Year":
			num = num * 365 * 24 * 60 * 60
		elif t[1] == "Week":
			num = num * 60 * 60 * 24 * 7
		elif t[1] == "Day":
			num = num * 60 * 60 * 24
		elif t[1] == "Hour":
			num = num * 60 * 60

		dt = [sum([float(y) for y in x.split(",")[3:4]])/2 for x in data[find(num, data):] if int(x.split(",")[1]) == int(sensor)]
		if len(dt) == 0:
			return []
		avgs += [sum(dt)/len(dt)]

	data = {
		"id": sensor,
		"name": "",
		"avgs": avgs,
		"inputs": averages,
		"graphTitle": "",
		"graphURL" : ""
	}
	print(json.dumps(data, indent=4))

	return json.dumps(data, indent=4)