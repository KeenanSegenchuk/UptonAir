#this is the main code for UptonAir that will run if it's made into an executeable file.

#since the "get" function to get the air data from purpleair's website isn't native to python, we have to pip install and import it.
#requests is the package that "get" is in
import requests
from time import time

#start by getting the sensor indices
sensorf = open("sensors.txt")
sensorf = sensorf.read().splitlines()[1:]
sensors = []
for line in sensorf:
	sensors.append(int(line.split(",")[1]))

#now find the time of the last sample of data you have downloaded
file = open("data.txt", "r").read().splitlines()
lastSample = int(file[len(file)-1].split(",")[0])

#now we build the url to the specific data we're trying to pull from purpleair.com's api

#this is the baseurl to pull data from purpleair's sensors
baseurl = ("https://api.purpleair.com/v1/sensors/")

#this just specifies we're pulling from a csv with that sensor's data history
historyurl = ("/history/csv?")

#specify that we want the last 2 weeks
#get current time in seconds since epoch of computers and cut off decimal points
endtime = int(time())
#number of seconds in 2 weeks
twoweeks = 604800
#two weeks ago's time
starttime = time() - twoweeks
#or whatever time the last data point was downloaded
#if starttime < lastSample:
	#starttime = lastSample
#now build url
timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)

#specify what data you want to pull
datafieldsurl = "&average=60&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity"

#this is my api key
key = "2F5CD35E-E169-11EE-B9F7-42010A80000D"
#now we build the api call with a url and a header
data = []
for sensor in sensors:
    print(f'Pulling data from sensor: {sensor}')
    url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
    header = {"X-API-Key": key}
    response = requests.get(url, headers=header)
    for line in response.content.decode('utf-8').splitlines():
        data.append(line)
        print(f'line: {line}')

#update file with new data
file = open("data.txt", "a")
i = 0
for line in data:
    if line[0:1] in "0123456789":
        file.write(line + "\n") 
    else:
        print(f"Erasing line: {line}")
    i += 1

print(f"Stopped before wirting remaining data: {data[i:]}")






