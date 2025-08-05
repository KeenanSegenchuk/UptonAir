from pullfn import *
from fileUtil import getSensors, getLastTimestamp
from getByDate import *
import json
import os
import threading
from datetime import datetime
from pgUtil import *

# Average the AQI of all sensors for given timespan
#route("/avg/<int:start>-<int:end>")
def avg(units, start, end):
	print(f"Avg {units} from {start} to {end} Requested...")
	sensors = getSensors()

	#connect to postgres database
	conn, cur = pgOpen()
	response = []
	#get avg for each sensor
	for sensor in sensors:
		pgQuery(cur, start, end, sensor, col = f"AVG({units})")
		data = cur.fetchone()
		try:
			response += [{"avg": float(sum(data)/len(data)), "id": sensor}]
		except:
			print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	print(f"api/avg/ outgoing response: {response}")
	return json.dumps(response, indent=4)

# Average the AQI of given sensor for given timespan
#route("/avg/<int:start>-<int:end>/<int:sensor_id>")
def avgS(units, start, end, sensor_id):
	print(f"Avg {units} from {start} to {end} Requested for Sensor {sensor_id}...")
	res = -1

	#connect to postgres database
	conn, cur = pgOpen()
	pgQueryAvg(cur, start, end, sensor_id, col = units)
	data = cur.fetchone()
	try:
		res = float(data[0])
	except:
		print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	print(f"api/avg/ outgoing response: {res}")
	return json.dumps(res, indent=4)

#pull time, aqi data for given timespan and sensor for plotting
#route("/time/<int:start>-<int:end>/<int:sensor_id>")
def timeS(units, start, end, sensor_id):
	conn, cur = pgOpen()
	if sensor_id == 0:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units}) AS average_AQI")
		data = cur.fetchall()
	else:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units})")
		data = cur.fetchall()

	#type and sort(?) unsorted pg data	
	data = [[row[0], int(row[1])] for row in data]
	#data.sort(key= lambda x: (x[0], x[1]))

	#package data
	data = {"data": data}
	pgClose(conn, cur) 

	return json.dumps(data, indent=4)

#Get aqi averages for each sensor for past x days/hours
#route("/sensorinfo/<int:sensor_id>")
def sensorinfo(units, sensor_id):	
	averages = ["6 months", "30 days", "1 week", "24 hours", "1 hour"]
	hour = 60 * 60
	day = 24 * hour
	end = datetime.now().timestamp()
	starts = [end - day*180, end - day * 30, end - day * 7, end - day * 1, end - hour]
	
	conn, cur = pgOpen()
	avgs = [-1 for avg in averages]

	for i, start in enumerate(starts):
		timespan = averages[i]
		#print(f"\Timespan: {timespan} — {datetime.fromtimestamp(start)} to {datetime.fromtimestamp(end)}")

		pgQueryAvg(cur, start, end, sensor_id, units)
		res = cur.fetchall()
		print(f"Response: {res}")
		try:
			avgs[i] = round(float(res[0][0]), 2)
		except:
			print(f"Error finding {averages[i]} avg for sensor {sensor_id}, defaulting to -1.") 
			avgs[i] = -1
	pgClose(conn, cur)

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": averages,
		"banner_avg": avgs[-1]
	}
	print(f"\n✅ /api/sensorinfo outgoing response: {json.dumps(response, indent=4)}")
	return response