from PMtoAQI import *
def cleanfn(data):
	if type(data) == str:
		data = data.splitlines()
	if type(data[0]) == str:
		data = [x.split(",") for x in data]
	
	data = [x for x in data if x[0][0] in "0123456789"]
	data.sort(key = lambda x: (int(x[0]), int(x[1])))
	data = [x + PMtoAQI(x[2],x[3],x[4]) if len(x) == 5 else x for x in data]
	return data
	
	
	
	