from time import *
import asyncio
from pullfn import *
from cleanfn import *
from pgUtil import *
from datetime import datetime
from send_email import *
from log import log

#This python file is meant to be run as a thread that updates the data every x minutes

update_time_minutes = 20
update_time_seconds = update_time_minutes*60
alert_delay = 30

def alert_loop():
    print(f"Checking if any alerts have been triggered... {datetime.now()}")
    triggered_alerts = pgAlert(update_time_seconds)
    new_triggered_alerts = pgCheckAlerts()
    if triggered_alerts:
        for alert in triggered_alerts:
            log(f"Alert triggered: {alert}")
            try:
                send_email(alert)
            except Exception as e:
                log(e);
        return
    if new_triggered_alerts:
        for alert in new_triggered_alerts:
            log(f"New Alert triggered: {alert}")
            try:
                send_email2(alert)
            except Exception as e:
                log(e);
        return
    print("No alerts triggered.")

def update_loop():
    if maxTimestamp() < datetime.now().timestamp() - update_time_seconds:
        try:
            cutoff, new_lines = asyncio.run(pullfn(return_data=True))
        except:
            log("Error pulling data. pullfn returned empty")
            return
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
        sleep(alert_delay)

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
	try:
		pgBuildAlertsTable(os.getenv("REBUILD_ALERTS") == "1")
	except:
		print("WARNING: Alerts table does not exist and/or building failed.")
	else:
		print("Succesfully located alerts table.")

	#add new columns
	pgAddPercentDifferenceColumn()
	pgAddPMColumn()

	if os.getenv("LOOP") == "0":
		print("LOOP env var is 0, data-updater returning.")
	else:
		while True:
			update_loop()
			sleep(update_time_seconds-alert_delay)
			print(f"{update_time_minutes} minutes passed, updating database...")