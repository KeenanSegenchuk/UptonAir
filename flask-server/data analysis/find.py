def find(data, time):
	bot = 0
	top = len(data)
	
	while bot < top:
		mid = (bot + top) // 2
		
		if(int(data[mid][0]) < time):
			bot = mid + 1
		else:
			top = mid
	return bot