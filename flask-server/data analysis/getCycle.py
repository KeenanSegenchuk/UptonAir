from mondayMidnight import get_monday_midnight as getMM
from find import find
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

def getCycle(range, cyclelen = 7*24*60*60):
	with open("data/uxbridge_data_aqi.txt") as file:
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
			avg = sum([float(x[3]) for x in data_points])/l #x[6:7] for aqi, x[2:2] for uxbridge data
			avgs += [avg]
		else:
			if False and len(avgs) > 0:
				avgs += [avgs[-1]]
			#else:
				#avgs += [0]
		#print(f"t1:{t1}, t2:{t2}, number of data points:{l}, avg:{avg}")		

		t1 += cyclelen
		t2 += cyclelen

	return avgs
	
def create_gradient(ax, color1, color2):
    """
    Create a bidirectional gradient from color1 to color2 and back to color1,
    and set it as the background for the given axis (ax).
    """
    # Create a custom colormap that goes from color1 to color2 and back to color1
    colors = [color1, color2, color1]
    n_colors = 256  # Number of gradient steps
    cmap = LinearSegmentedColormap.from_list("custom_gradient", colors, N=n_colors)
    
    # Create the gradient as a 2D array
    gradient = np.linspace(0, 1, n_colors).reshape(1, -1)
    gradient = np.vstack([gradient] * n_colors)  # Make the gradient 2D

    # Show the gradient as the background
    ax.imshow(gradient, aspect='auto', cmap=cmap, extent=[0, 23, 0, 50], zorder=-10)

with open("data/uxbridge_data_aqi.txt") as file:
	data = file.read().splitlines()[1:]
	print(sum(float(x.split(",")[2]) for x in data))
with open("data/uxbridge_data_aqi.txt") as file:
	data = file.read().splitlines()[1:]
	print(sum(float(x.split(",")[2]) for x in data))

print("CHECKING FOR CYCLES IN AQI DATA")
day = 60*60*24
days = []
day_avgs = []
for i in range(7):
	days += [getCycle([day*i, day*(i+1)])]
	day_avgs += [sum(days[i])/len(days[i])]
	print(f"avg for {i+1}th day of the week: {day_avgs[-1]}")
x = [x for x in range(len(days[0]))]
plt.bar(range(1, 8), day_avgs, color="red")
plt.xlabel("day of the week")
plt.ylabel("avg AQI reading")
plt.xlim(0, 8)
plt.ylim(0, 50)
plt.show()

hours = []
avgs = []
hour = 60*60
for i in range(24):
	hours += [getCycle([hour*i, hour*(1+i)], day)]
	avgs += [sum(hours[i])/len(hours[i])]
	print(f"avg for {i+1}th hour of the day: {avgs[-1]}")
fig, ax = plt.subplots()
create_gradient(ax, (64/255, 125/255, 144/255), (176/255, 224/255, 230/255))
ax.plot(range(24), avgs, color="red")
plt.xlabel("hour of the day")
plt.ylabel("avg AQI reading")
plt.xlim(0, 23)
plt.ylim(0, 50)
plt.show()

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
