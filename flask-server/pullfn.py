import requests
from cleanfn import cleanfn
from time import time, sleep
import asyncio
import sys
import os
from pgUtil import getTimestamp
from fileUtil import getSensors, getPAirSensors

pulled_data_path = "data/pulled_data.txt"
data_path = "data/data.txt"

def _request_with_retry(url, headers, max_retries=3):
	"""
	Attempt an HTTP GET with exponential backoff on connection or HTTP errors.
	Sleeps 2**attempt seconds between retries (1s, 2s, 4s for max_retries=3).
	Raises the final exception if all attempts are exhausted.
	"""
	for attempt in range(max_retries):
		try:
			response = requests.get(url, headers=headers)
			response.raise_for_status()
			return response
		except (requests.exceptions.ConnectionError, requests.exceptions.HTTPError) as e:
			if attempt < max_retries - 1:
				wait = 2 ** attempt
				print(f"Request failed (attempt {attempt + 1}/{max_retries}): {e}. Retrying in {wait}s...")
				sleep(wait)
			else:
				raise


async def pull(starttime, endtime, id = 0):
	#this function is used to fill gaps in the database on startup when that is enabled

	#init constants for building api call
	baseurl = ("https://api.purpleair.com/v1/sensors/")
	historyurl = ("/history/csv?")
	timeurl = "start_timestamp=" + str(int(starttime)) + "&end_timestamp=" + str(int(endtime))
	datafieldsurl = "&average=10&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity_a"
	key = os.getenv("PURPLEAIR_API_KEY")
	header = {"X-API-Key": key}

	#populate data with responses from purpleair's api
	data = []
	def pull_helper(url):
		#pull from purpleair's api
		try:
			response = _request_with_retry(url, header)
		except Exception as e:
			print(f"Failed to pull from sensor {url} after retries: {e}")
			return []
		with open(pulled_data_path, "a") as file:
			for line in response.content.decode('utf-8').splitlines():
				data.append(line)
				print(f'line: {line}')
				file.write(line)

	#build the pull_helper calls for given sensor(s)
	if id == 0:
		#get data for all sensors
		sensors = [sensor for sensor in getPAirSensors() if sensor != 0]
		for sensor in sensors:
			print(f'Pulling data from sensor: {sensor}')
			url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
			pull_helper(url)

	else:
		#get data from specific sensor
		url = baseurl + str(id) + historyurl + timeurl + datafieldsurl
		pull_helper(url)

	#keep track of new data to push to postgres
	new_lines = []
	#append to existing data
	file = open(data_path, "a")
	for line in data:
		if len(line) > 0 and line[0] in "0123456789":
			new_lines += [line]
			file.write(line + "\n")

	return new_lines

async def pullfn(return_data = False):
	#this is the function we use to pull our data normally

	if not hasattr(pullfn, "ignore_pull_limit"):
		pullfn.ignore_pull_limit = os.getenv("IGNORE_MAX_PULL") == "1"

	#get sensor IDs
	sensors = [sensor for sensor in getPAirSensors() if sensor != 0]

	#set max pull timespan to 2 weeks to avoid large api calls
	endtime = int(time())
	twoweeks = 2*7*24*60*60
	onehour = 60*60
	#only pull data from within the last hour
	starttime = int(time()) - onehour

	#open data file
	file = open(data_path, "r").read().splitlines()
	while len(file[-1]) == 0 or file[-1][0] not in "0123456789":
		print(f"Deleting non-data text line from data.txt: {file[-1]}")
		del file[-1]
	file = [x.split(",") for x in file]


	#check for last entry in data.txt, replaced by checking database
	lastSample = [-1 for sensor in sensors]

	print(f"Checking for data pulled from sensors: {sensors}")
	lastSample = [getTimestamp(sensor)+1 for sensor in sensors] #if 0 set to 2 weeks ago so API call goes through

	print(f"Pulling data after last entry: {lastSample}...")

	#init constants for building api call
	baseurl = ("https://api.purpleair.com/v1/sensors/")
	historyurl = ("/history/csv?")
	timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)
	datafieldsurl = "&average=10&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity_a"
	key = os.getenv("PURPLEAIR_API_KEY")

	#populate data with responses from purpleair's api
	data = []
	for sensor in sensors:
		if pullfn.ignore_pull_limit:
			print(f"pulling from sensor: {sensor}, using lastsample: {lastSample[sensors.index(sensor)]}")
			timeurl = "start_timestamp=" + str(lastSample[sensors.index(sensor)]) + "&end_timestamp=" + str(int(endtime))
		elif lastSample[sensors.index(sensor)] == -1:
			timeurl = "start_timestamp=" + str(int(starttime)) + "&end_timestamp=" + str(int(endtime))
		else:
			timeurl = "start_timestamp=" + str(max(lastSample[sensors.index(sensor)], starttime)) + "&end_timestamp=" + str(endtime)

		#build api call
		print(f'Pulling data from sensor: {sensor}')
		url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
		header = {"X-API-Key": key}
		#pull from purpleair's api
		try:
			response = _request_with_retry(url, header)
		except Exception as e:
			print(f"Failed to pull from sensor {sensor} after retries: {e}")
			return []
		with open(pulled_data_path, "a") as file:
			for line in response.content.decode('utf-8').splitlines():
				data.append(line)
				print(f'line: {line}')
				file.write(line)

	file = open(data_path, "a")
	#keep track of new data to push to postgres
	new_lines = []
	#append to existing data
	for line in data:
		if len(line) > 0 and line[0] in "0123456789":
			new_lines += [line]
			file.write(line + "\n")

	pullfn.ignore_pull_limit = False

	#return oldest data point added to data so we know not to re-sort the data from before that
	try:
		oldest_point = min(int(x[:10]) for x in data if x[0] in "0123456789")
	except ValueError:
		# min() raised because no data was received from the API cal
		if return_data:
			return (0, [])
		else:
			return 0
	if return_data:
		print("Returning Pulled Data...")
		return [oldest_point, new_lines]
	else:
		return oldest_point
