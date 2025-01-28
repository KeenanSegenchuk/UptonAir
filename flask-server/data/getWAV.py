def getWAV(data, start, end, labda):
	waveform = []
	sample = []
	for cutoff in range(start+labda, end, labda):
		while len(data) > 0 and data[0][0] <= cutoff:
			sample += [data[0][1]]
			del data[0]
		if len(sample) == 0:
			waveform += [0]
		else:
			waveform += [sum(sample)/len(sample)] 
	return waveform