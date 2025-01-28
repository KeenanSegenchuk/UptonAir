from datetime import datetime
import sys

def ISO2Secs(timestamp):
	timestamp = timestamp.rstrip("Z")
	return int(datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S").timestamp())
def combine(hfile, pfile, ofile): #combine humidity and pm2.5 csvs 
	with open(hfile) as h:
		hdata = h.read().splitlines()
	with open(pfile) as p:
		pdata = p.read().splitlines()
	header = False
	outdata = []
	for hline, pline in zip(hdata, pdata):
		sp = hline.split(",")
		if len(sp) == 2:
			[t, h] = sp
		else:
			print(f"Cannot seperate line by comma: {hline}")
		sp = pline.split(",")
		if len(sp) == 2:
			p = sp[1]
		else:
			print(f"Cannot seperate line by comma: {pline}")
		try:
			outdata += [[ISO2Secs(t), h, p]]
		except:
			header = [[t, h, p]]
			print(f"Cannot convert timestamp: {t}")
	nl = "\n"
	if header:
		outstring = ""
	else:
		outstring = header
	for line in outdata:
		outstring += nl + ",".join([str(x) for x in line])
	with open(ofile, "w") as outfile:
		outfile.write(outstring)

	return

if len(sys.argv) == 4:
	combine(sys.argv[1], sys.argv[2], sys.argv[3])