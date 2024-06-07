import math

#open data file in read/write mode
file = open("data.txt", "r+")

#extract lines of data
data = file.read().splitlines()
header = data[0]
data = data[1:]

#mergesort the data by timestamp
def merge(a1, a2):
	#merge 2 sorted arrays
	a = []
	index1 = 0
	index2 = 0
	try:
		while True:
			if a1[index1].split(',')[0] < a2[index2].split(',')[0]:
				a.append(a1[index1])
				index1 = index1 + 1
			else:
				a.append(a2[index2])
				index2 = index2 + 1
	except Exception as e:
		if index1 >= len(a1):
			while index2 < len(a2):
				a.append(a2[index2])
				index2 = index2 + 1
		elif index1 < len(a1):
			while index1 < len(a1):
				a.append(a1[index1])
				index1 = index1 + 1
	return a

def sort(data):
	#sort the data via mergesort
	if len(data) <= 1:
		return data
	half = math.floor(len(data)/2)
	a1 = data[:half]
	a2 = data[half + 1:]
	return merge(sort(a1), sort(a2))

#mergesort the data by timestamp
data = sort(data)

sensors = []
duplicates = []
sf = open("sensors.txt", "r")
sensordata = sf.read().splitlines()
for line in sensordata:
	if line.split(",")[1].isdigit():
		sensors.append(line.split(",")[1])
		duplicates.append(False)

timestamp = 0
cleaned = []
for line in data:
	if line.split(",")[0] != timestamp:
		i = 0
		timestamp = line.split(",")[0]
		while i < len(duplicates):
			duplicates[i] = False
			i = i + 1
	sensor = line.split(",")[1]
	if sensor in sensors:
		i = sensors.index(sensor)
		if duplicates[i]:
			continue;
		else:
			cleaned.append(line)
			duplicates[i] = True

data = []
data.append(header)
data.extend(cleaned)
file.write(data)

		