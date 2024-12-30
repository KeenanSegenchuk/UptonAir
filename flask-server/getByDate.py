import datetime

def getByDate(sensors, start, end):
	if type(sensors) == int:
		sensors = [str(sensors)]
	else:
		sensors = [str(s) for s in sensors]

	#print(f'Sensors: {sensors}')
	#print(f'Start: {start}. End: {end}')

	def bs(data, t):
		h = len(data) - 1
		l = 0
		while h > l + 1:
			m = int((h+l)/2)
			if int(data[m][0]) < t:
				l = m 
			else:
				h = m-1
		return h

	if type(start) == str:
		#print("Converting start from date to timestamp...")
		start = datetime.strptime(start, "%m/%d/%y").timestamp()
	if type(end) == str:
		#print("Converting end from date to timestamp...")
		end = datetime.strptime(end, "%m/%d/%y").timestamp()

	data = []
	with open("data.txt") as df:
		data = df.read().splitlines()[1:]
	#print(f'Data before sensor check: {data}.')
	data = [y.split(",") for y in data if y.split(",")[1] in sensors]
	#print(f'Data after sensor check: {data}.')

	start = bs(data, start)
	endt = end
	end = bs(data, end)

	data = data[start:end]
	data += [x for x in data[end:end+len(sensors)] if int(x[0]) == endt]
	#print(f'Data after indexing: {data}.')

	return data