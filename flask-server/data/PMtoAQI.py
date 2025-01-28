def PMtoAQI(humidity, avg):

	f1 = lambda x, h: .524*x-.0862*h+5.75
	f2 = lambda x, h: (.786*(x/20-3/2)+.524*(1-(x/20-3/2)))*x-.0862*h+5.75
	f3 = lambda x, h: .786*x-.0862*h+5.75
	f4 = lambda x, h: (.69*(x/50-21/5)+.786*(1-(x/50-21/5)))*x-.0862*h*(1-(x/50-21/5))+2.966*(x/50-21/5)+5.75*(1-(x/50-21/5))+8.84*.0001*x*x*(x/50-21/5)
	f5 = lambda x, h: 2.966+.69*x+8.84*.0001*x*x
	eparanges  = [30, 50, 210, 260, 10000]
	epaformulas= [f1, f2, f3, f4, f5]
	i = 0
	while i < 5:
		if avg < eparanges[i]:
			break;
		i += 1

	f_AQI = lambda I1, I2, P1, P2, C: ((I2-I1)/(P2-P1))*(C-P1)+I1
	pranges = [0, 9, 35.4, 55.4, 125.4, 225.4, 10000]
	iranges = [0, 50, 100, 150, 200, 300, 500]
	i1 = 0
	i2 = 1
	while i2 < len(pranges):
		if avg <= pranges[i2]:
			AQI = f_AQI(iranges[i1], iranges[i2], pranges[i1], pranges[i2], avg)
			PM_EPA = epaformulas[i](avg, humidity)
			AQI_EPA = f_AQI(iranges[i1], iranges[i2], pranges[i1], pranges[i2], PM_EPA)
			return AQI_EPA#return [PM_EPA, AQI, AQI_EPA]
		i1 += 1
		i2 += 1
from getWAV import *	
import numpy as np
import sys
from scipy.io.wavfile import write
if len(sys.argv) > 1:
	with open(sys.argv[1]) as infile:
		data = infile.read().splitlines()

	header = "timestamp, humidity, pm_2.5atm, AQI"
	aqi_data = []
	print("init processing")
	i = 0
	for line in data[1:]:
		i += 1
		x = line.split(",")
		if i % 10000 == 1:
			print(x[0])
		try:
			aqi = PMtoAQI(int(x[1]),float(x[2]))
			aqi_data += [aqi]
		except:
			print(f"Not working for line: {line.split(',')}")
	print("done processing")
	
	if len(sys.argv) == 2:
		for i in range(1,len(data)):
			data[i] += "," + str(aqi_data[i])
		data[0] = header
		with open(sys.argv[1], "w") as outfile:
			outfile.write("\n".join(data))
	else:
		times = [int(x.split(",")[0]) for x in data[1:]]
		print(times)
		if len(sys.argv) == 4:
			labda = int(sys.argv[3])
		else:
			labda = 60 * 60

		start = times[0]
		end = times[len(times)-1]
		data = [[x, y] for x, y in zip(times, aqi_data)]
		#print(data)
		data = getWAV(data, start, end, labda)
		print(data)
		data = np.int16(data)
		write(sys.argv[2], 24, data)