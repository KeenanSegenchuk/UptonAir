from time import *
import asyncio
from pullfn import *
from cleanfn import *
from pgUtil import *
from fileUtil import getSensorMap
from datetime import datetime
from send_email import *
from log import log
from statusChecker import checkStatus, send_alert
import traceback

#This python file is meant to be run as a thread that updates the data every x minutes

update_time_minutes = 20
update_time_seconds = update_time_minutes*60
alert_delay = 30

def alert_loop():
    print(f"Checking if any alerts have been triggered...")
    triggered_alerts = pgCheckAlerts()
    if triggered_alerts:
        for alert in triggered_alerts:
            print(f"New Alert triggered: {alert}")
            try:
                send_email3(alert)
            except Exception as e:
                log(f"Send_Email Exception: {e}");
        return
    print("No alerts triggered. See important-logs.txt for more alert logs.")

def update_loop():
    if maxTimestamp() < datetime.now().timestamp() - update_time_seconds:
        try:
            cutoff, new_lines = asyncio.run(pullfn(return_data=True))
        except Exception as e:
            print(f"Error pulling data: {e}")
            traceback.print_exc()
            return
        print(f"About to clean after cutoff: {cutoff - update_time_seconds}")
        if os.getenv("CLEANING") != "true": 
            os.environ['CLEANING'] = "true"
            cleanfn("data.txt", cutoff - update_time_seconds)
            os.environ['CLEANING'] = "false"
            print("Finished Updating CSV.")
        else:
            print("Already Cleaning data.txt...")

        #convert from format pulled from purpleair to db format. change from pAir id to db id if id changed in purpleair
        new_lines = formatLines(new_lines, "tuple")
            
        conn, cur = pgOpen()
        pgPushData(cur, new_lines)
        pgClose(conn, cur)
        print(f"New max timestamp: {maxTimestamp()}")            


        #wait so that data can finish updating before checking for alerts
        sleep(alert_delay)

        #check for alerts
        try:
                alert_loop()
        except:
                send_alert("DATABASE NOT STALE, ALERT_LOOP THREW ERROR")
        #send text alert to admin if database is not up to date
        checkStatus()


if __name__ == "__main__":
	print("Data-Updater checking for db connection and readings table:")
	while not pgInit("data.txt", os.getenv("REINIT_DB") == "1"):
		print("pgInit could not connect to the database...")
		print("Waiting 20 seconds then trying to connect again.")
		sleep(20)
	print("Successfully connected to db and readings table.")	

	#make sure alerts table exists
	try:
		pgBuildAlertsTable(os.getenv("REBUILD_ALERTS") == "1")
	except:
		print("WARNING: Alerts table does not exist and/or building failed.")
	else:
		print("Succesfully located alerts table.")

	#make sure chatlogs table exists
	try:
		pgBuildChatLogs()
	except:
		print("WARNING: ChatLogs table does not exist and/or building failed.")
	else:
		print("Succesfully located chatlgos table.")

	#add generated columns 
	#pgAddPercentDifferenceColumn()
	#pgAddPMColumn()

	if os.getenv("LOOP") == "0":
		print("LOOP env var is 0, data-updater returning.")
	else:
		while True:
			update_loop()
			sleep(update_time_seconds-alert_delay)
			print(f"{update_time_minutes} minutes passed, updating database...")