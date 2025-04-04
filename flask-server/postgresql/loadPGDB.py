import psycopg2

conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="p!ssw0rd", port=5432)
cur = conn.cursor()

def loadFile(path):
	format = [int, int, float, float, float, float, int, int]
	with open(path) as file:
		data = file.read().splitlines()
	print(data.pop(0))
	process = lambda line: [format[i](entry) for i, entry in enumerate(line.split(","))]
	data = [process(line) for line in data]
	return data

cur.execute("""CREATE TABLE IF NOT EXISTS readings (
	time INT,
	id INT,
	humidity NUMERIC(3, 1),
	PMA NUMERIC(6, 3),
	PMB NUMERIC(6, 3),
	PMEPA NUMERIC(6, 3),
	AQI SMALLINT,
	AQIEPA SMALLINT);
""")

data = loadFile("../data.txt")

#cur.execute("""INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA) VALUES
#	data
#""")
cur.executemany("""
    INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
""", data)

conn.commit()
cur.close()
conn.close()