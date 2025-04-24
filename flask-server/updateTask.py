from time import *
import asyncio
from pullfn import *
from cleanfn import *
from pgUtil import *
from datetime import datetime
from alerts.send_email import *

#This python file is meant to be run as a thread that updates the data every x minutes

update_time_minutes = 20
update_time_seconds = update_time_minutes*60

def alert_loop():
    triggered_alerts = pgAlert(update_time_seconds)
    if triggered_alerts:
        #TODO:
        #seperate out into phone numbers and emails
        #send text and email alerts stating that the minimum AQI they specified in their alert has been exceded
        for address in triggered_alerts:
            isEmail = True
            if isEmail:
                print(f"Sending Email Alert to Address: {address}")
            else:
                print(f"Sending Text Alert to Address: {address}")

def update_loop():
    if maxTimestamp() < datetime.now().timestamp() - update_time_seconds:
        cutoff, new_lines = asyncio.run(pullfn(return_data=True))
        print(f"About to clean after cutoff: {cutoff - update_time_seconds}")
        if os.getenv("CLEANING") != "true": 
            os.environ['CLEANING'] = "true"
            cleanfn("data.txt", cutoff - update_time_seconds)
            os.environ['CLEANING'] = "false"
            print("Finished Updating CSV.")
        else:
            print("Already Cleaning data.txt...")

        new_lines = formatLines(new_lines, "tuple")
        #print(new_lines)
	    
        print("Pushing to postgres database...")
        conn, cur = pgOpen()
        pgPushData(cur, new_lines)
        pgClose(conn, cur)
        print(f"New max timestamp: {maxTimestamp()}")            


        #wait so that data can finish updating before checking for alerts
        sleep(60)

        #check for alerts
        alert_loop()



if __name__ == "__main__":
	print("Data-Updater checking for db connection and readings table:")
	while not pgInit("data.txt", os.getenv("REINIT_DB") == "1"):
		print("pgInit could not connect to the database...")
		print("Waiting 20 seconds then trying to connect again.")
		sleep(20)
	print("Successfully connected to db and readings table.")
	
	#make sure alerts table exists
	print("Data-Updater checking for alerts table:")
	conn, cur = pgOpen()
	check = pgCheck(cur, "alerts")
	print(f"Checked if alerts table exists, result: {check}") 
	if check:
		print("Found alerts table.")
	else:
		pgBuildAlertsTable(cur)
		print("Counld not find alerts. Built new empty alerts table.")
	pgClose(conn, cur)


	if os.getenv("LOOP") == "0":
		print("LOOP env var is 0, data-updater returning.")
	else:
		while True:
			update_loop()
			sleep(update_time_seconds-60)
			print(f"{update_time_minutes} minutes passed, updating database...")