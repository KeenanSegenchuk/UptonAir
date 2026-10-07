import json
import os


def _resolve_sensor_file():
	#sensor-info.json lives at the repo root but this module is imported from
	#several working directories (flask-server/, the container /app, tests).
	#Resolve it once, relative to this file, so cwd never matters.
	here = os.path.dirname(os.path.abspath(__file__))
	candidates = (
		os.path.join(here, "..", "sensor-info.json"),
		os.path.join(here, "sensor-info.json"),
		"sensor-info.json",
	)
	for path in candidates:
		if os.path.exists(path):
			return os.path.abspath(path)
	return "sensor-info.json"


#tests monkeypatch this module-level name to point at a fixture file
sensor_file = _resolve_sensor_file()

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
	raise NotImplementedError("getLastTimestamps")

def getSensors():
	#return a list of all sensor ids as they are in our database
	with open(sensor_file, "r") as json_file:
		sensors = json.load(json_file)
	sensors = [int(sensor["id"]) for sensor in sensors]
	return sensors

def getPAirSensors():
	#return a list of all sensor ids as they are on purpleair
	with open(sensor_file, "r") as json_file:
		sensors = json.load(json_file)
	sensors = [int(sensor.get("pAir_id") or sensor["id"]) for sensor in sensors]
	return sensors

def getSensorMap():
	#return dict that maps purplair ids to db ids
	sensor_map = {}
	with open(sensor_file, "r") as json_file:
		sensors = json.load(json_file)
	for sensor in sensors:
		if sensor.get("pAir_id"):
			sensor_map[sensor["pAir_id"]] = sensor["id"]
	return sensor_map

def getSensorNames(ids):
	#return list of ids and names
	with open(sensor_file, "r") as json_file:
		sensors = json.load(json_file)

	sensor_dict = {int(sensor["id"]): sensor["name"] for sensor in sensors}
	names = [sensor_dict.get(id, f"Sensor {id}") for id in ids]
	return names






def fileUtilTests():
	print(getLastTimestamp())
	print(getSensors())
#fileUtilTests()