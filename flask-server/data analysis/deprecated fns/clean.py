import math
import time
from PMtoAQI import *
from pullfn import pullfn
import asyncio

def clean(cut = True, cutoff = int(time.time()) - 60*60*24*14):
	#open data file in read/write mode
	file = open("data.txt", "r")
	
	#extract lines of data
	data = file.read().splitlines()
	print(f'fileLen: {len(data)}')
	header = data[0]
	data = [[float(x) for x in l.split(",")] for l in data[1:] if "null" not in l.split(",")]
	
	#TODO: JUST FIND INDEX WHERE CUTOFF OCCURS, AND WRITE AFTER THAT
	new_data = []
	c  = 0
	old_idx = []
	fline_pointer = 1
	for line in data:
		if len(line) == 0:
			del data[c]
		else:
			t = line[0]
			if cut:
				if int(t) >= cutoff:
					new_data += [line]
					cut = False
				else:
					old_idx += [c]
					fline_pointer += 1
			else:
				new_data += [line]
			#if int(t) >= cutoff and cut:
			#	new_data += [line]	
			#	print(f"Keeping line {line} for being after cutoff: {cutoff}")
			#else:
			#	old_idx += [c]
		c += 1
	old_data = [data[i] for i in old_idx]
	data = new_data
	print(f'fpointer: {fline_pointer}')
	print(f'lenData: {len(data)}')
	print(f'lenOld_Data: {len(old_data)}')
	#mergesort the data by timestamp
	def merge(a1, a2):
		#merge 2 sorted arrays
		a = []
		index1 = 0
		index2 = 0
		
		while index2 < len(a2) and index1 < len(a1):
			if int(a1[index1][0]) < int(a2[index2][0]):
				a.append(a1[index1])
				index1 = index1 + 1
			else:
				a.append(a2[index2])
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
	data = [x + PMtoAQI(x[2],x[3],x[4]) if len(x) == 6 else x for x in data]
	print(f'lenData after sort: {len(data)}')	

	sensors = []
	duplicates = []
	sf = open("sensors.txt", "r")
	sensordata = sf.read().splitlines()
	for line in sensordata:
		if line.split(",")[1].isdigit():
			sensors.append(float(line.split(",")[1]))
			duplicates.append(False)

	print("Checking for duplicates...")
	timestamp = 0
	cleaned = []
	#print(f'Sensors: {sensors}')
	for line in data:
		try:
			if int(line[0]) != timestamp:
				i = 0
				timestamp = int(line[0])
				while i < len(duplicates):
					duplicates[i] = False
					i = i + 1
			sensor = line[1]
			#print(f'Sensor: {sensor}')
			if sensor in sensors:
				i = sensors.index(sensor)
				if duplicates[i]:
					#print(f'Duplicate line removed: {line}')
					continue
				else:
					cleaned.append(line)
					duplicates[i] = True
		except:
			print(f"error on line: {line}.")
			continue

	print("Reformatting old data...")
	data = header + "\n"
	for line in old_data:
		if len(line) < 8:
			print(f"deleting line: {line}")
			continue
		data = data + ",".join([str(int(line[0])), str(int(line[1])), str(line[2]), str(line[3]), str(line[4]), str(round(line[5],2)), str(int(line[6])), str(int(line[7]))]) + "\n"
	
	print("Caulculating AQI...")
	for line in cleaned:
		if len(line) < 8:
			print(f"preventing deleting line: {line}")
			VALS = PMtoAQI(line[2], line[3], line[4])
			data = data + ",".join([str(int(line[0])), str(int(line[1])), str(line[2]), str(line[3]), str(line[4]), str(round(VALS[0],2)), str(int(VALS[1])), str(int(VALS[2]))]) + "\n"
		else:
			data = data + ",".join([str(int(line[0])), str(int(line[1])), str(line[2]), str(line[3]), str(line[4]), str(round(line[5],2)), str(int(line[6])), str(int(line[7]))]) + "\n"

	print("Adding newlines...")
	data2 = "";
	for line in data.splitlines():
		if line != "\n":
			data2 += line + "\n"
	data = data2
	
	print("Writting Data...")
	file = open("data.txt", "w")
	file.write(data)
	print("Done Writting.")

