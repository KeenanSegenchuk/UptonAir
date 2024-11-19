import json
from get import *

def getMapInfo():
	data = get("1 hour")
	
	with open("data/sensor-pos.json", "r") as json_file:
		sensors = json.load(json_file)

	for sensor in sensors:
		id = int(sensor['id'])
		sdata = [(x[3] + x[4])/2 for x in data if int(x[1]) == id] 
		
		if len(sdata) == 0:
			print(f"Missing Data for Sensor: {id}")
			sensor['color'] = 'black'
			sensor['avg'] = -1
			continue

		avgairqual = sum(sdata)/len(sdata)
		sensor['avg'] = avgairqual
		if avgairqual < 5:
			sensor['color'] = 'green'
		elif avgairqual < 12.5:
			sensor['color'] = 'yellow'
		elif avgairqual < 25:
			sensor['color'] = 'orange'
		else:
			sensor['color'] = 'red'

	#print(json.dumps(sensors, indent=4))
	return json.dumps(sensors, indent=4)
		