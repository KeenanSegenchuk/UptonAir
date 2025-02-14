import requests
from cleanfn import cleanfn
from time import time
import asyncio

async def pullfn():
    sensorf = open("sensors.txt")
    sensorf = sensorf.read().splitlines()[1:]
    sensors = []
    for line in sensorf:
        sensors.append(int(line.split(",")[1]))

    file = open("data.txt", "r").read().splitlines()
    while len(file[-1]) == 0 or file[-1][0] not in "0123456789":
        print(f"Deleting non-data text line from data.txt: {file[-1]}")
        del file[-1]
    lastSample = int(file[len(file)-1].split(",")[0])
    print(f"Pulling data after last entry at {lastSample}...")

    #check to see if any sensors weren't pulled in that batch
    lastSensors = [x.split(",")[1] for x in file[len(file)-len(sensors):]]
    

    baseurl = ("https://api.purpleair.com/v1/sensors/")
    historyurl = ("/history/csv?")
    endtime = int(time())

    twoweeks = 604800
    starttime = time() - twoweeks
    maxPullStarttime = starttime

    if starttime < lastSample:
        starttime = lastSample
    if endtime - starttime < 60*30:
        return "no new updates"

    timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)
    datafieldsurl = "&average=10&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity"
    key = "97F2B4FA-DD87-11EF-A3B4-42010A800010"

    data = []
    for sensor in sensors:
        if sensor in lastSensors:
            timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)
        else:
	    timeurl = "start_timestamp=" + str(maxPullStarttime) + "&end_timestamp=" + str(endtime)
	
	print(f'Pulling data from sensor: {sensor}')
        url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
        header = {"X-API-Key": key}
        response = requests.get(url, headers=header)
        for line in response.content.decode('utf-8').splitlines():
            data.append(line)
            print(f'line: {line}')

    #print(f"lenData: {len(data)}, dirty data: {data}")
    data = cleanfn(data)
    #print(f"lenData: {len(data)}, clean data: {data}")

    # update file with new data
    file = open("data.txt", "a")
    i = 0

    for line in data:
        file.write(",".join(line) + "\n")
        i += 1

    if i < len(data):
        print(f"Stopped before writing remaining data: {data[i:]}")
    return "finished pulling data"