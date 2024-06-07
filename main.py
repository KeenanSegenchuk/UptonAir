#this is the main code for UptonAir that will run if it's made into an executeable file.

#since the "get" function to get the air data from purpleair's website isn't native to python, we have to pip install and import it.
#requests is the package that "get" is in
import requests
#same with pandas' function to read a table from a csv (comma seperated value) file
import pandas
from time import time

#start by getting the sensor indices
sensors = pandas.read_csv("sensors.txt")
print(sensors)
#get the column with the sensor ids
sensors = sensors['SENSOR_ID']


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
#now build url
timeurl = "start_timestamp=" + str(starttime) + "&end_timestamp=" + str(endtime)

#specify what data you want to pull
datafieldsurl = "&average=60&fields=pm2.5_atm_a%2C%20pm2.5_atm_b%2C%20humidity"

#this is my api key
key = "2F5CD35E-E169-11EE-B9F7-42010A80000D"
#now we build the api call with a url and a header
data = []
for sensor in sensors:
    url = baseurl + str(sensor) + historyurl + timeurl + datafieldsurl
    header = {"X-API-Key": key}
    response = requests.get(url, headers=header)
    for line in response.content.decode('utf-8').splitlines():
        data.append(line)

#update file with new data
file = open("data.txt", "a")
for line in data:
    if line == "{":
        break;
    if line[0:1] in "0123456789":
        file.write('\n' + line) 






