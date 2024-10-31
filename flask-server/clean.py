import math
import time
def clean():
	#open data file in read/write mode
	file = open("data.txt", "r")
	
	#extract lines of data
	data = file.read().splitlines()
	print(f'fileLen: {len(data)}')
	header = [data[0]]
	data = data[1:]

	cutoff = int(time.time()) - 60*60*24*14
	c  = 0
	for line in data:
		if len(line) == 0:
			del data[c]
		else:
			l = line.split(",")[0]
			if int(l) < cutoff:
				header += [line]
				del data[c]
		c += 1

	print(f'lenData: {len(data)}')
	print(f'lenHeader: {len(header)}')
	#mergesort the data by timestamp
	def merge(a1, a2):
		#merge 2 sorted arrays
		a = []
		index1 = 0
		index2 = 0
		
		while index2 < len(a2) and index1 < len(a1):
			try:
				if int(a1[index1].split(',')[0]) < int(a2[index2].split(',')[0]):
					a.append(a1[index1])
					index1 = index1 + 1
				else:
					a.append(a2[index2])
					index2 = index2 + 1
			except:
				if "," not in a1[index1]:
					index1 = index1 + 1
				if "," not in  a2[index2]:
					index2 = index2 + 1
	
		while index2 < len(a2):
			while index2 < len(a2):
				a.append(a2[index2])
				index2 = index2 + 1
		while index1 < len(a1):
			while index1 < len(a1):
				a.append(a1[index1])
				index1 = index1 + 1
		return a

	def sort(data):
		#sort the data via mergesort
		if len(data) <= 1:
			return data
		half = math.floor(len(data)/2)
		#print(f"data: {data}")
		a1 = data[:half]
		#print(f"a1: {a1}")
		a2 = data[half:]
		#print(f"a2: {a2}")
		return merge(sort(a1), sort(a2))
	
	#mergesort the data by timestamp
	data = sort(data)
	print(f'lenData after sort: {len(data)}')	

	sensors = []
	duplicates = []
	sf = open("sensors.txt", "r")
	sensordata = sf.read().splitlines()
	for line in sensordata:
		if line.split(",")[1].isdigit():
			sensors.append(line.split(",")[1])
			duplicates.append(False)
	
	print(f'Found sensors: {sensors}')

	timestamp = 0
	cleaned = []
	print(f'Sensors: {sensors}')
	for line in data:
		try:
			if int(line.split(",")[0]) != timestamp:
				i = 0
				timestamp = int(line.split(",")[0])
				while i < len(duplicates):
					duplicates[i] = False
					i = i + 1
			sensor = line.split(",")[1]
			#print(f'Sensor: {sensor}')
			if sensor in sensors:
				i = sensors.index(sensor)
				if duplicates[i]:
					print(f'Duplicate line removed: {line}')
					continue
				else:
					cleaned.append(line)
					duplicates[i] = True
		except:
			print(f"error on line: {line}.")
			continue
	
	data = 	""
	for line in header:
		data = data + line + "\n"
	
	for line in cleaned:
		data = data + line + "\n"

	data2 = "";
	for line in data.splitlines():
		if line != "\n":
			data2 = data2 + line + "\n"
	data = data2

	file = open("data.txt", "w")
	file.write(data)

clean()
		