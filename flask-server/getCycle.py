from mondayMidnight import get_monday_midnight as getMM
from find import find
import matplotlib.pyplot as plt

def getCycle(range, cyclelen = 7*24*60*60):
	with open("data/uxbridge_data.txt") as file:
		data = file.read()
	data = data.splitlines()[1:]
	data = [x.split(",") for x in data]
	
	start = getMM(int(data[0][0]))
	end = getMM(int(data[-1][0]), True)
	
	t1, t2 = start + range[0], start + range[1]
	avgs = []
	while t2 <= end:
		data_points = data[find(data,t1):find(data,t2)]
		l = len(data_points)
		if l > 0:
			avg = sum([(float(x[2]) + float(x[2]))/2 for x in data_points])/l #x[6:7] for aqi, x[2:2] for uxbridge data
			avgs += [avg]
		else:
			if False and len(avgs) > 0:
				avgs += [avgs[-1]]
			else:
				avgs += [0]
		#print(f"t1:{t1}, t2:{t2}, number of data points:{l}, avg:{avg}")		

		t1 += cyclelen
		t2 += cyclelen

	return avgs
	
print("CHECKING FOR CYCLES IN AQI DATA")
day = 60*60*24
days = []
for i in range(7):
	days += [getCycle([day*i, day*(i+1)])]
	print(f"avg for {i+1}th day of the week: {sum(days[i])/len(days[i])}")
x = [x for x in range(len(days[0]))]

hours = []
hour = 60*60
for i in range(24):
	hours += [getCycle([hour*i, hour*(1+i)], day)]
	print(f"avg for {i+1}th hour of the day: {sum(hours[i])/len(hours[i])}")

plt.plot(x, days[0], label='monday', color='red')
plt.plot(x, days[1], label='tuesday', color='orange')
plt.plot(x, days[2], label='wednesday', color='yellow')
plt.plot(x, days[3], label='thursday', color='green')
plt.plot(x, days[4], label='friday', color='blue')
plt.plot(x, days[5], label='saturday', color='black')
plt.plot(x, days[6], label='sunday', color='brown')
plt.xlabel("week number")
plt.ylabel("avg AQI")
plt.legend()
plt.show()
