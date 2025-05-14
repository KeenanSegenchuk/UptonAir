import psycopg2
import os
from PMtoAQI import *

'''
	pgUtil.py contains useful functions for interfacing with the postgreSQL database
	
	Author: Keenan
	
	Functions:
	 General:
	  pgOpen: () => (connection, cursor) :connects to the database and returns the connection and a pointer
	  pgClose: (connection, cursor) => () :commits the cursor and closes the connection
	  pgCheck: (cur, str) => (bool) :checks if table exists
	  formatLines: ([str]) => ([tuple]) :converts lines from raw purpleair to tuples or strings with AQI fields added
	  pgConcat: (cur) => ([str]) :fetches all queries on a given cursor and concats them into
	 Data:
	  pgTest: () => () :runs a basic test
	  maxTimestamp: () => (int) :returns the maximum time stored in the database
	  pgQueryAvg: see fn :returns query for average of a given column for some time-sensor slice of the data
 	  pgQuery: see fn :returns qury for some time-sensor slice of the database a list of comma-delimited strings
	  pgPushData: (cur, [tuple]) => () :pushes all rows in list of tuples to database
	  pgInit: (str, bool) => (bool) :tries to connect to database, returns False if cannot, then checks for, and if not there, initializes data table
	 Alerts:
	  pgAlert: (int) => ([str]) :checks if any alerts have been triggered in the last <int> seconds, returns addresses of triggered alerts
	  pgBuildAlertsTable: (cur) => () :initializes alerts table
	  pgPushAddress: (cur, tuple) => () :pushes rows to alerts table
	  pgRemoveAddress: (cur, str) => () :removes all instance of an email address/phone number from alerts table
'''	  
			

def pgOpen():
	DB_URL = os.getenv("DB_URL")
	try:
		conn = psycopg2.connect(DB_URL)
	except:
		print("Failed connecting to postgre via env var, using local dev db instead.")
		conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="passwOrd", port=5432)

	cur = conn.cursor()
	#cur.execute("""SELECT * FROM Readings LIMIT 3;""")
	#print(f"Defaulting to dev table: {cur.fetchone()}.")

	return [conn, cur]

def pgClose(conn, cur):
	conn.commit()
	cur.close()
	conn.close()

def pgCheck(cur, table):       
	# SQL query to check if the table exists
	query = """
	SELECT EXISTS (
       		SELECT 1
       		FROM pg_catalog.pg_tables
       		WHERE schemaname = 'public'
       		AND tablename = %s
       	);
	"""
	cur.execute(query,(table,))
	return cur.fetchone()[0]

def formatLines(lines, format = "tuple"):
	#converts lines from raw purpleair to tuples or strings with AQI fields added
	lines = [line.split(",") for line in lines]
	#check for invalid values
	lines = [line[0:3] + [int(float(line[3])<float(line[4])), min(float(line[3]), float(line[4])), 999, 999, 999] if float(line[3]) > 750 or float(line[4]) > 750 else line + PMtoAQI(float(line[2]), float(line[3]), float(line[4])) for line in lines]

	if format == "tuple":
		return [tuple(line) for line in lines]
	elif fomart == "str":
		return [",".join(line) for line in lines]
	else:
		print("Error: unrecognized line format")

def pgConcat(cur):
	return [",".join([str(x) for x in line]) for line in cur.fetchall()]

def pgTest():
	conn, cur = pgOpen()
	pgQuery(cur, 1724187600, 1724198400, 0)
	return pgConcat(cur)

def maxTimestamp():
	conn, cur = pgOpen()
	query = """SELECT MAX(time) FROM readings"""
	cur.execute(query)
	
	result = cur.fetchone()
	pgClose(conn, cur)
	return result[0] if result else None

def pgQueryAvg(cur, start, end, sensor, col = "*"):
	query = """SELECT AVG({col}) FROM readings 
		WHERE time >= %s AND time <= %s
		"""

	if sensor != 0:
		query += " AND id = %s"
		cur.execute(query.format(col=col), (start, end, sensor))
	else:
		cur.execute(query.format(col=col), (start, end))	

def pgQuery(cur, start, end, sensor, col = "*"):
	query = """SELECT {col} FROM readings 
		WHERE time >= %s AND time <= %s
		"""

	if sensor != 0:
		query += " AND id = %s"
		query += " ORDER BY time ASC"
		cur.execute(query.format(col=col), (start, end, sensor))
	else:
		query += " GROUP BY time"
		query += " ORDER BY time ASC"
		cur.execute(query.format(col=col), (start, end))

	#print(f"pgQuery running query: {query.format(col=col)}")
	#print("Parameters:", (start, end, sensor))
	

def pgPushData(cur, data):
	#print(f"Pushing data {data}")
	#TODO: check for PM2.5 > 999 and humidity > .999 to filter out anamolous readings that don't fit database
	cur.executemany("""
		    INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA)
		    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
		    ON CONFLICT (time, id) DO NOTHING
		""", data)

def pgInit(path, rebuild = False):
	#pgInit: check connection to db/table and initialize data table if need be

	def check(conn, cur, table):        
		# SQL query to check if the table exists
		query = """
			SELECT EXISTS (
				SELECT 1
			  	FROM pg_catalog.pg_tables
	      			WHERE schemaname = 'public'
       	 			AND tablename = %s
       			);
		"""
		cur.execute(query,(table,))
		return cur.fetchone()[0]
	
	def loadFile(path):
		format = [int, int, float, float, float, float, int, int]
		with open(path) as file:
			data = file.read().splitlines()[1:]
		process = lambda line: [format[i](entry) for i, entry in enumerate(line.split(","))]
		data = [process(line) for line in data]
		return data

	#check for connection to database
	try:
		conn, cur = pgOpen()
	except:	
		return False

	#check for/setup table
	if rebuild or not check(conn, cur, "readings"):
		if rebuild:
			print(f"Forcing table rebuild from {path}.")
			cur.execute("DROP TABLE IF EXISTS readings;")
		cur.execute("""CREATE TABLE IF NOT EXISTS readings (
			time INT,
			id INT,
			humidity NUMERIC(3, 1),
			PMA NUMERIC(6, 3),
			PMB NUMERIC(6, 3),
			PMEPA NUMERIC(6, 3),
			AQI SMALLINT,
			AQIEPA SMALLINT,
			CONSTRAINT readings_pkey PRIMARY KEY (time, id)
		);""")
	
		data = loadFile(path)
		pgPushData(cur, data)
		#cur.executemany("""
		#    INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA)
		#    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
		#""", data)
		print("BUILT NEW PG TABLE")
	else:
		print("CHECK FOUND EXISTING PG TABLE")
	pgClose(conn,cur)
	
	return True


# ^^^^^^ Data Table "readings"
# vvvvvv Contact Table "alerts"

def pgAlert(update_time_seconds):
	#pgAlert checks if any alerts have been triggered in the past <update_time_seconds> seconds
	lastTimestamp = maxTimestamp()
	firstTimestamp = lastTimestamp - update_time_seconds

	#open connection to database
	conn, cur = pgOpen()
	if not pgCheck(cur, "alerts"):
		print("Failed to find alerts table, aborting pgAlert.")
		pgClose(conn, cur)
		return False

	#check if average AQIEPA values are greater than the min_AQI of any rows in alerts table
	# and retrieve address column from those rows
	cur.execute("""
		SELECT address
		FROM alerts
		WHERE min_AQI <= (
		    SELECT AVG(AQIEPA)
		    FROM readings
		    WHERE readings.time BETWEEN %s AND %s
		)
	""", (firstTimestamp, lastTimestamp))
	
	'''
	#check if readings table has any AQIEPA values that are greater than the min_AQI of any rows in alerts table
	# and retrieve address column from those rows
	cur.execute("""
	        SELECT alerts.address
	        FROM readings
	        JOIN alerts ON readings.address = alerts.address
	        WHERE readings.timestamp BETWEEN to_timestamp(%s) AND to_timestamp(%s)
	          AND readings.AQIEPA > alerts.min_AQI
	""", (firstTimestamp, lastTimestamp))
	'''

	addresses = cur.fetchone()
	pgClose(conn, cur)

	return addresses

def pgBuildAlertsTable(cur):
	#build new postgreSQL table to store alerts info
	cur.execute(f"""CREATE TABLE IF NOT EXISTS alerts (
		address TEXT PRIMARY KEY,
		min_AQI INT,
		last_alert INT
	);""")

def pgPushAddress(cur, row):
	#add new addresses or update their rows
	try:
		cur.execute("""
			INSERT INTO alerts (address, min_AQI, last_alert)
			VALUES (%s, %s, %s)
		""", row)
	except:
		print(f"Tried inserting existing address into alerts table, updating min_AQI, reseting last_alert: {row}")
		cur.execute("""
			UPDATE alerts
			SET min_AQI = %s,
			    last_alert = %s,
			WHERE address = %s
		""", (row[1], row[2], row[0]))

	#conn.comit()
	#commit's rows to table

def pgRemoveAddress(cur, address):
	cur.execute("""
		DELETE FROM alerts
		WHERE address = %s
	""", (address,))

if __name__ == "__main__":
	#pgInit("data.txt")
	conn, cur = pgOpen()
	print(pgCheck(conn, cur, "alerts")) 
	pgBuildTable(cur, "alerts")
	print(pgCheck(conn, cur, "alerts"))
	pgClose(conn, cur)
	
