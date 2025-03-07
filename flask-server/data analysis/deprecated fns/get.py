from time import time

def get(window):

	def find(T, data):
		t = int(data[len(data)-1].split(",")[0])
		T = t - T
		
		top = len(data) - 1
		bottom = 0
		while T != t:
			t = int(data[int((top+bottom)/2)].split(",")[0])
			#print(f'sample time: {t}, looking for {T}.')
			if T > t:
				bottom = int((top+bottom)/2 + 1)
			elif T < t:
				top = int((top+bottom)/2 - 1)
			if abs(top - bottom) <= 1:
				return bottom;
		return int((top+bottom)/2)

	t = ""
	num = 0
	times = ["month", "year", "day", "week", "minute", "hour", "YTD"]
	
	nums = [int(s) for s in window.split() if s.isdigit()]
	nums.reverse()
	c = 1
	for n in nums:
		num += c * n
		c = c * 10

	for T in times:
		if T in window:
			t = T
			break
	
	file = open("data.txt")
	data = file.read().splitlines()[1:]

	if t == "month": 
		num = num * 30 * 24 * 60 * 60
	elif t == "year":
		num = num * 365 * 24 * 60 * 60
	elif t == "week":
		num = num * 60 * 60 * 24 * 7
	elif t == "day":
		num = num * 60 * 60 * 24
	elif t == "hour":
		num = num * 60 * 60
	elif t == "minute":
		num = num * 60
	elif t == "YTD":
		ctime = int(data[len(data)-1].split(",")[0])
		num = int(time.strftime("%j", time.localtime(ctime))) * 24 * 60 * 60

	data = data[find(num, data):]
	newdata = []
	for row in data:
		newrow = []
		for num in row.split(","):
			if num != "":
				newrow = newrow + [float(num)]
			else:
				break;
		if newrow:
			newdata += [newrow]
	
	return newdata

def avg(data):
	col = 1
	sum = 0
	count = 0
	for line in data:
		val = line.split(",")[col]
		sum = sum + col
		count = count + 1
	return sum/count
