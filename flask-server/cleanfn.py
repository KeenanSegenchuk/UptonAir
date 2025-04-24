from PMtoAQI import *
import bisect
def cleanfn(data_filename, cutoff):
	#cleanfn takes in (data_filename, cutoff)
	#opens data file and cleans data after time cutoff, then write altered data to file
	with open(data_filename, "r") as dfile:
		data = dfile.read().splitlines()
	
	header = data.pop(0)
	#bisect to find cutoff, extract after, sort, write
	second_data = [int(x[:10]) for x in data]
	i = bisect.bisect_left(second_data, cutoff)
	old_data = [header] + data[:i]
	new_data = data[i:]
	data = ""

	print(f"Cleaning {len(new_data)} new data points")

	new_data = [x.split(",") for x in new_data]
	new_data = [x for x in new_data if x[0][0] in "0123456789"]
	new_data = [x + PMtoAQI(x[2],x[3],x[4]) if len(x) == 5 else x for x in new_data]
	new_data = [",".join(line) for line in new_data]
	new_data = list(set(new_data))
	new_data = [x.split(",") for x in new_data]
	new_data.sort(key = lambda x: (int(x[0]), int(x[1])))

	for line in old_data:
		data += line + "\n"
	for line in new_data:
		data += ",".join(line) + "\n"

	#print(new_data)

	with open(data_filename, "w") as dfile:
		dfile.write(data)
	
if __name__ == "__main__":
	cleanfn("data.txt", 1744819800)