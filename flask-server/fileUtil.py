import json

def getLastTimestamp(filename = "data.txt"):
	#get last timestamp from data file
	with open(filename, "rb") as f:
		#seek to end of file
		f.seek(-2, 2)
		while f.read(1) != b'\n':
			f.seek(-2, 1)
		line = f.readline().decode()
		return int(line.split(",")[0])
		
def getLastTimestamps(filename = "data.txt"):
	#get last timestamp for each sensor
	return #TODO

def getSensors():
	#return a list of all sensor ids
	with open("sensor-pos.json", "r") as json_file:
		sensors = json.load(json_file)
	sensors = [int(sensor["id"]) for sensor in sensors]
	return sensors

def getSensorNames(ids):
	#return list of ids and names
	with open("sensor-pos.json", "r") as json_file:
		sensors = json.load(json_file)

	sensor_dict = {int(sensor["id"]): sensor["name"] for sensor in sensors}
	names = [sensor_dict.get(id, f"Sensor {id}") for id in ids]
	return names






def fileUtilTests():
	print(getLastTimestamp())
	print(getSensors())
#fileUtilTests()