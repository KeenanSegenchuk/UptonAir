import psycopg2
from psycopg2 import errors
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
	  getTimestamp: (int) => (int) :returns max time in database for a given sensor
	  pgQueryAvg: see fn :returns query for average of a given column for some time-sensor slice of the data
 	  pgQuery: see fn :returns qury for some time-sensor slice of the database a list of comma-delimited strings
	  pgPushData: (cur, [tuple]) => () :pushes all rows in list of tuples to database
	  pgInit: (str, bool) => (bool) :tries to connect to database, returns False if cannot, then checks for, and if not there, initializes data table
	  pgFindGaps: (int = 1200, int = 300) => ([(int, int)]) :
  	    Scans the readings table for gaps in the timestamp sequence where the difference 
  	    between adjacent entries exceeds `min_gap` seconds (default 1200). 
  	    Returns a list of (start, end) tuples with a buffer (default 300 sec) 
  	    added after the start and before the end of each gap.
	 Alerts:
	  pgAlert: (int) => ([str]) :checks if any alerts have been triggered in the last <int> seconds, returns addresses of triggered alerts
	  pgBuildAlertsTable: (cur) => () :initializes alerts table
	  pgPushAddress: (cur, tuple) => () :pushes rows to alerts table
	  pgRemoveAddress: (cur, str) => () :removes all instance of an email address/phone number from alerts table
'''	  
			
def pgOpen():
	DB_URL = os.getenv("DB_URL")
	if DB_URL:
		conn = psycopg2.connect(DB_URL)
	else:
		print("Failed connecting to postgre via env var, using local dev db instead.")
		conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="passwOrd", port=5432)

	cur = conn.cursor()
	conn.autocommit = True
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

def getTimestamp(sensor_id):
    conn, cur = pgOpen()
    query = """SELECT MAX(time) FROM readings WHERE id = %s"""
    cur.execute(query, (sensor_id,))
    
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
		query += " GROUP BY time"
		query += " ORDER BY time ASC"
		cur.execute(query.format(col=col), (start, end, sensor))
	else:
		query += " GROUP BY time"
		query += " ORDER BY time ASC"
		cur.execute(query.format(col=col), (start, end))

	#print(f"pgQuery running query: {query.format(col=col)}")
	#print("Parameters:", (start, end, sensor))
	

def pgPushData(cur, data):
	for row in data:
		try:
			cur.execute("""
			    INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA)
			    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
			    ON CONFLICT (time, id) DO NOTHING
			""", row)
		except Exception as e:
			print(f"Error inserting row {row}: {e}")

def pgInit(path, rebuild = False):
	#pgInit: check connection to db/table and initialize data table if need be

	print("	INIT ")

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
		print(f"Forcing table rebuild from {path}.")
		cur.execute("DROP TABLE IF EXISTS readings;")
		cur.execute("""CREATE TABLE IF NOT EXISTS readings (
			time INT,
			id INT,
			humidity NUMERIC(4, 1),
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

def pgFindGaps(min_gap=1200, buffer=300):
	"""
	Returns a list of (start, end) tuples representing gaps in the readings table 
	where the time difference between consecutive entries exceeds `min_gap` seconds.
	Each tuple is adjusted by `buffer` seconds on both sides.
	"""
	conn, cur = pgOpen()

	# Fetch ordered list of timestamps
	cur.execute("""
		SELECT time FROM readings 
		GROUP BY time 
		ORDER BY time ASC
	""")
	times = [row[0] for row in cur.fetchall()]
	pgClose(conn, cur)

	# Scan for gaps
	gaps = []
	for i in range(1, len(times)):
		diff = times[i] - times[i - 1]
		if diff > min_gap:
			start = times[i - 1] + buffer
			end = times[i] - buffer
			gaps.append((start, end))

	return gaps

# ^^^^^^ Data Table "readings"
# vvvvvv Contact Table "alerts"

def pgAlert(update_time_seconds):
	#pgAlert checks if any alerts have been triggered in the past <update_time_seconds> seconds
	lastTimestamp = maxTimestamp()
	firstTimestamp = lastTimestamp - update_time_seconds
	print(f"Timestamps: {firstTimestamp} {lastTimestamp}")

	#open connection to database
	conn, cur = pgOpen()
	if not pgCheck(cur, "alerts"):
		print("Failed to find alerts table, aborting pgAlert.")
		pgClose(conn, cur)
		return False

	#check if average AQIEPA values are greater than the min_AQI of any rows in alerts table
	# and retrieve address column from those rows
	cur.execute("""
		WITH avg_values AS (
			SELECT 
				a.address,
				a.name,
				(
					SELECT AVG(r.AQIEPA)
					FROM readings r
					WHERE r.time BETWEEN (%s - a.avg_window * 60) AND %s
						AND r.id = ANY(a.ids)
				) AS avg_aqi
			FROM alerts a
		)
		SELECT 
			a.address,
			a.name,
			a.min_AQI,
			a.ids,
			a.cooldown,
			a.avg_window,
			a.last_alert,
			a.n_triggered,
			av.avg_aqi
		FROM alerts a
		JOIN avg_values av ON av.address = a.address AND av.name = a.name
		WHERE av.avg_aqi >= a.min_AQI
			AND (a.last_alert IS NULL OR a.last_alert < (%s - a.cooldown * 60 * 60))
	""", (lastTimestamp, lastTimestamp, lastTimestamp))
	
	#^^^^^ might want to make it check if any sensor average exceeds min_AQI

	alerts = cur.fetchall()

	#TODO: vvvvv make sure this works
	# Update each triggered alert
	updates = [(lastTimestamp, alert[0], alert[1]) for alert in alerts]
	cur.executemany("""
		UPDATE alerts
		SET
			n_triggered = n_triggered + 1,
			last_alert = %s
		WHERE address = %s AND name = %s
	""", updates)

	conn.commit()
	pgClose(conn, cur)

	return alerts

def pgAlert1(update_time_seconds):
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
		SELECT address, name, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered
		FROM alerts
		WHERE min_AQI <= (
		    SELECT AVG(AQIEPA)
		    FROM readings 
		    WHERE readings.time BETWEEN (%s - alerts.avg_window*60) AND %s
		    AND readings.id = ANY(alerts.ids)
		)
		AND (last_alert IS NULL OR last_alert < (%s - alerts.cooldown*60*60))
	""", (lastTimestamp, lastTimestamp, lastTimestamp))
	
	#^^^^^ might want to make it check if any sensor average exceeds min_AQI

	addresses = cur.fetchall()
	pgClose(conn, cur)

	return addresses

def pgBuildAlertsTable(rebuild):
	conn, cur = pgOpen()

	#build new postgreSQL table to store alerts info
	if rebuild or not pgCheck(cur, "alerts"):
		print("Rebuilding alerts table...")
		cur.execute("DROP TABLE IF EXISTS alerts;")
		cur.execute(f"""CREATE TABLE IF NOT EXISTS alerts (
			address TEXT,
			name TEXT,
			min_AQI INT,
			ids INT[],
			cooldown INT,
			avg_window INT,
			last_alert INT,
			n_triggered INT,
			CONSTRAINT unique_name_address UNIQUE (address, name)
		);""")

	pgClose(conn, cur)

def pgPushAddress(cur, row):
	#add new addresses or update their rows
	try:
		cur.execute("""
			INSERT INTO alerts (address, name, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered)
			VALUES (%s, %s, %s, %s, %s, %s, %s, %s)	
		""", row)
	except psycopg2.errors.UniqueViolation:
		return 1
	except Exception as e:
		print("Unhandled DB error:", e)
		return 2
	return 0

def pgRemoveAddress(cur, address, name):
	try:
		cur.execute("""
			DELETE FROM alerts
			WHERE address = %s AND name = %s
		""", (address, name))

		if cur.rowcount == 0:
			return 1  # No row deleted (not found)
		return 0  # Successful deletion

	except Exception as e:
		print("Unhandled DB error during deletion:", e)
	return 2

def pgListAlerts(cur):
	cur.execute("SELECT address, name, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered FROM alerts")
	rows = cur.fetchall()
	
	print(rows)

import time
from collections import defaultdict

def pgCheckAlerts():
    conn, cur = pgOpen()
    now = int(time.time())
    
    # Get all alerts that are eligible to trigger
    cur.execute("""
        SELECT * FROM alerts
        WHERE %s - last_alert >= cooldown * 60 * 60 
    """, (now,))
    alerts = cur.fetchall()

    triggered_alerts = []

    for alert in alerts:
        address, name, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered = alert

        print(f"Selected alert: {alert}")

        window_start = now - avg_window * 60

        # Get AQI averages for readings from relevant ids in the time window
        cur.execute("""
            SELECT id, AVG(AQIEPA) as avg_aqi
            FROM readings
            WHERE id = ANY(%s)
              AND time >= %s
            GROUP BY id
        """, (ids, window_start))
        
        results = cur.fetchall()
        
        if len(results) == 0:
            continue

        # Check if any average exceeds the threshold
        triggered_ids = []
        total = 0
        for id_val, avg_aqi in results:
            total += avg_aqi
            if avg_aqi > min_AQI:
                triggered_ids.append((id_val, float(avg_aqi)))

        avg_all = total / len(results)

        # If any triggers occurred, record the result then update db entry
        if triggered_ids:
            print(f"Alert Tiggered: {name}, {triggered_ids}")
            if True:
                triggered_alerts.append({
                    "alert": {
                        "address": address,
                        "name": name,
                        "min_AQI": min_AQI,
                        "ids": ids,
                        "cooldown": cooldown,
                        "avg_window": avg_window,
                        "last_alert": last_alert,
                        "n_triggered": n_triggered + 1  # this is what it *will* be after the update
                    },
                    "triggered_ids":triggered_ids,
                    "avg_aqi":avg_all
                })

            cur.execute("""
                UPDATE alerts
                SET last_alert = %s,
                    n_triggered = n_triggered + 1
                WHERE address = %s AND name = %s
            """, (now, address, name))

    conn.commit()
    conn.close()
    return triggered_alerts

import json
from datetime import datetime

#convenient to print useful stuff to logs
def pgLog(triggered_alerts, filename="log.txt"):
    with open(filename, "a") as f:
        for alert_entry in triggered_alerts:
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "triggered_id": alert_entry["triggered_id"],
                "average_aqi": alert_entry["average_aqi"],
                "alert": alert_entry["alert"]
            }
            f.write(json.dumps(log_entry) + "\n")

#check for then add column
def pgAddColumn(table_name, column_name, data_type, function):
    conn, cur = pgOpen()

    # check tbale exists
    if(not pgCheck(cur, table_name)):
        print("TRYING TO ADD COLUMN TO TABLE THAT DOESN'T EXIST")

    # check if column already exists
    cur.execute("""
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = %s AND column_name = %s
    """, (table_name, column_name))
    if cur.fetchone():
        print(f"Column '{column_name}' already exists in '{table_name}'.")
        pgClose(conn, cur)
        return

    cur.execute(f"""
        ALTER TABLE {table_name}
        ADD COLUMN {column_name} {data_type}
        {function}
    """)

    conn.commit()
    pgClose(conn, cur)

def pgAddPercentDifferenceColumn():
    function = """
        GENERATED ALWAYS AS (
          CASE
            WHEN (PMA + PMB) = 0 THEN NULL
            ELSE ROUND((ABS(PMA - PMB) / ((PMA + PMB) / 2.0)) * 100)
          END
        ) STORED;
    """
    pgAddColumn("readings", "percent_difference", "INTEGER", function)

    #check it worked
    conn, cur = pgOpen()
    cur.execute("""
        SELECT PMA, PMB, percent_difference
        FROM readings
        ORDER BY id DESC
        LIMIT 10
    """)
    rows = cur.fetchall()
    print("printing rows with new percent_difference column...")
    print("[PMA, PMB, percent_difference]")
    for row in rows:
        print(row)
    pgClose(conn, cur)

def pgAddPMColumn():
    function = """
        GENERATED ALWAYS AS (
	    ((PMA + PMB)/2.0)
	) STORED;
    """

    pgAddColumn("readings", "PM", "NUMERIC(6, 3)", function)

    #check it worked
    conn, cur = pgOpen()
    cur.execute("""
        SELECT PMA, PMB, PM
        FROM readings
        ORDER BY id DESC
        LIMIT 10
    """)
    rows = cur.fetchall()
    print("printing rows with new PM column...")
    print("[PMA, PMB, PM]")
    for row in rows:
        print(row)
    pgClose(conn, cur)

if __name__ == "__main__":
	#pgInit("data.txt")
	conn, cur = pgOpen()
	print(pgCheck(conn, cur, "alerts")) 
	pgBuildAlertsTable(cur)
	print(pgCheck(conn, cur, "alerts"))
	pgClose(conn, cur)
	
