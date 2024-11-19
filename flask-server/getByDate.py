import datetime

def getByDate(sensors, start, end):
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
		start = datetime.strptime(start, "%m/%d/%y").timestamp()
	if type(end) == str:
		end = datetime.strptime(end, "%m/%d/%y").timestamp()

	data = []
	with open("data.txt") as df:
		data = df.read().splitlines()[1:]
	data = [x for x in [y.split(",") for y in data] if x[1] in sensors]

	start = bs(data, start)
	endt = end
	end = bs(data, end)

	data = data[start:end]
	data += [x for x in data[end:end+len(sensors)] if int(x[0]) == endt]

	return data