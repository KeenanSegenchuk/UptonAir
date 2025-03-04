import requests
from cleanfn import cleanfn
from time import time
import asyncio
import sys

async def pullfn():
    sensorf = open("sensors.txt")
    sensorf = sensorf.read().splitlines()[1:]
    sensors = []
    #get sensor IDs
    for line in sensorf:
        sensors.append(int(line.split(",")[1]))

    #set max pull timespan to 2 weeks to avoid large api calls
    endtime = int(time())
    twoweeks = 604800
    starttime = time() - twoweeks

    #open data file
    file = open("data.txt", "r").read().splitlines()
    while len(file[-1]) == 0 or file[-1][0] not in "0123456789":
        print(f"Deleting non-data text line from data.txt: {file[-1]}")
        del file[-1]
    file = [x.split(",") for x in file]

    #find the last data point from each sensor
    print(f"Checking for data pulled from sensors: {sensors}")
    lastSample = [-1 for sensor in sensors]
    for i in range(len(file)-1, -1, -1):
        index = -1
        if int(file[i][1]) in sensors:
            index = sensors.index(int(file[i][1]))
            #print(f"Found sensor in index {index} while checking data line: {file[i][0]},{file[i][1]}.")
        if index != -1 and lastSample[index] == -1:
            lastSample[index] = file[i][0]
        if -1 not in lastSample or int(file[i][0]) < starttime:
            break
    print(f"Pulling data after last entry: {lastSample}...")

    #init constants for building api call 
    baseurl = ("https://api.purpleair.com/v1/sensors/")
    historyurl = ("/history/csv?")
    timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)
    datafieldsurl = "&average=10&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity"
    key = "97F2B4FA-DD87-11EF-A3B4-42010A800010"

    #populate data with responses from purpleair's api
    data = []
    for sensor in sensors:
        if lastSample[sensors.index(sensor)] == -1:
            timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)
        else:
            timeurl = "start_timestamp=" + str(lastSample[sensors.index(sensor)]) + "&end_timestamp=" + str(endtime)
	
	#build api call
        print(f'Pulling data from sensor: {sensor}')
        url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
        header = {"X-API-Key": key}
	#pull from purpleair's api
        response = requests.get(url, headers=header)
        for line in response.content.decode('utf-8').splitlines():
            data.append(line)
            print(f'line: {line}')

    file = open("data.txt", "a")
    i = 0
    #append to existing data
    for line in data:
        if line[0] in "0123456789":
            file.write(line + "\n")
        i += 1

    #return oldest data point added to data so we know not to re-sort the data from before that
    return min(int(x[:10]) for x in data if x[0] in "0123456789")



