from getByDate import *

def getWAV(sensors, start, end, labda, aqi = True, zero = True, combine = True):
	data = getByDate(sensors, start, end)

	waveform = []
	sample = []
	for cutoff in range(start+labda, end, labda):
		while len(data) > 0 and data[0][0] < cutoff:
			sample += [data[i]]
			del data[i]
		
		if len(sample) == 0:
			if zero:
				waveform += [0]
			else:
				return #TODO
		else:
			if combine:
				if aqi:
					sample = [(int(x[5]) + int(x[6]))/2 for x in sample]
				else:
					sample = [(int(x[3]) + int(x[4]))/2 for x in sample]
				waveform += [sum(sample)/len(sample)]  
			else:
				return #TODO
	return waveform