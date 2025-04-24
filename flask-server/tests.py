from pgUtil import *
from datetime import datetime, timezone
import subprocess

print(" ")
print("Running tests...")
print("Checking database... ")

#check plaintext archive
try:
	with open("data.txt") as dfile:
		data = dfile.read().splitlines()
	print(f"- found data.txt with data from {data[1][0:10]} to {data[-1][0:10]} seconds.")
except:
	print("- failed to open data.txt")

#open connection to postgres db
conn, cur = pgOpen()
table = "readings"
res = pgCheck(cur, table)
print(f"- checking postgres database for table {table}: {res}")

try:
	query = """
		SELECT 
		    MIN(time) AS min_time,
		    MAX(time) AS max_time
		FROM {};
		""".format(table)
	cur.execute(query)
	result = cur.fetchone()
	mintime, maxtime = result[0:2]
	timestamp = datetime.now(timezone.utc).timestamp()
	
	print(f"- found data from {mintime} to {maxtime} seconds. Current time: {int(timestamp)}")
except Exception as e:
	print(f"- failed to find table or interpret its data. Error: {e}")

print("Testing and Initiating Updater...")
subprocess.Popen(["python3", "updateTask.py"])
print("Started subprocess that pulls new data from purpleair every 10 minutes.")
	



print(" ")