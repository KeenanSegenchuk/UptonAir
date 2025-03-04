import datetime

def getByDate(sensors, start, end, qc = True):
	if type(sensors) == int:
		sensors = [str(sensors)]
	else:
		sensors = [str(s) for s in sensors]

	#print(f'Sensors: {sensors}')
	#print(f'Start: {start}. End: {end}')

	def bs(data, t):
		#binary search
		h = len(data) - 1
		l = 0
		while h>l:
			m = (h+l)//2
			if int(data[m][0]) < t:
				l = m+1
			else:
				h = m
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
	
	#check for consistent readings between both air sensor channels
	if qc:
		max_percent_diff = .62
		max_val_diff = 5
		avg = lambda x: (float(x[3]) + float(x[4]))/2
		diff = lambda x: abs(float(x[3])-float(x[4]))
		check = lambda x: (d := diff(x))<=max_val_diff or (a:=avg(x))==0 or d/a<=max_percent_diff 
		data = [x for x in data if check(x)]

	start = bs(data, start)
	endt = end
	end = bs(data, end)

	data = data[start:end]
	data += [x for x in data[end:end+len(sensors)] if int(x[0]) == endt]
	#print(f'Data after indexing: {data}.')

	return data