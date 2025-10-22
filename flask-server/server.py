# This is our backend file
import asyncio
from flask import Flask, Blueprint, request, send_from_directory, jsonify, make_response
from flask_cors import CORS
from pullfn import *
from fileUtil import getSensors, getLastTimestamp
from getByDate import *
import json
import os
import threading
from datetime import datetime
from pgUtil import *
from updateTask import update_loop
from send_email import send_summary_email
from chatbot import send_prompt

app = Flask(__name__)
CORS(app)
datafile = "data.txt"

#log stuff before request
@app.before_request
def log_api_calls():
    if request.path.startswith('/api'):
        print(f"[{int(datetime.utcnow().timestamp())}]/[{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}] API CALL: {request.method} {request.url}")


# API ROUTES
alert_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts') #API for submitting and withdrawing emails/phone #s from alerts system
data_bp = Blueprint('data', __name__, url_prefix='/api/data') #API for pulling data with various units
raw_bp = Blueprint('raw', __name__, url_prefix='/api/raw') #API for pulling raw data
sensor_info_bp = Blueprint('sensorinfo', __name__, url_prefix='/api/sensorinfo') #API for preformated sensorinfo JSON
# PULL ARCHIVE
@app.route("/api/full_data")
def raw_data():
    with open(datafile, "r") as data:
        csv_data = data.read()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=readings.csv"}
    )

# CHATBOT
@app.post('/api/chat')
def chat():
	payload = request.get_json().get("body")
	if isinstance(payload, str):
		payload = json.loads(payload)

	prompt = json.dumps(payload.get("prompt"))
	try:
		sessionID = payload.get("id")
	except:
		sessionID = 0	
	response = send_prompt(prompt, sessionID)
	return jsonify({"response":response})


# ALERTS
# Add new email alert to database
@alert_bp.route("add/<string:address>/<string:name>/<string:unit>/<int:min_AQI>/<string:ids>/<int:cooldown>/<int:avg_window>", methods=["POST"])
def add_alert(address, name, unit, min_AQI, ids, cooldown, avg_window):
	if ids == "All":
		ids = [id for id in getSensors() if id != 0]
	else:
		ids = [int(id) for id in ids.split(",")]
	DATA_ROW = (address, name, unit, min_AQI, ids, cooldown, avg_window, 0, 0) #a row of data has this format, the two 0s are the last time an alert has been issued to the given contact address, and how many times this alert has been triggered
	
	conn, cur = pgOpen()
	
	#check for table
	if not pgCheck(cur, "alerts"):
		print("WARNING: Alert table not found when trying to add alert.")
	
	response = pgPushAddress(cur, DATA_ROW)
	#commit new entry to table
	conn.commit()
	pgClose(conn, cur)

	responses = [
		(jsonify(message="Email alert pushed to database."), 200),
		(jsonify(error="Could not add the alert since name is not unique."), 400),
		(jsonify(error="Unknown Error."), 500)
	]
	return responses[response]

# Remove address from db
@alert_bp.route("remove/<string:address>/<string:name>/", methods=["POST"])
@alert_bp.route("remove/<string:address>/<string:name>", methods=["POST"])
def remove_alert(address, name):
	print(f"Removing Alert: {address}, {name}")

	conn, cur = pgOpen()

	if name == "ALERT_SUMMARY":
		summary_alerts = pgListAlerts(cur, address)
		send_summary_email(summary_alerts, address)
		return (jsonify(message=f"Sent summary email to {address}."), 200)

	if not pgCheck(cur, "alerts"):  	#check for table
		print("WARNING: Alert table not found when trying to add alert.")

	response = pgRemoveAddress(cur, address, name)
	pgClose(conn, cur)
	responses = [
		(jsonify(message="Alert removed database."), 200),
		(jsonify(error="Could not find an alert with given email and name."), 400),
		(jsonify(error="Unknown Error."), 500)
	]
	return responses[response]

app.register_blueprint(alert_bp)

# DATA

# Average the data of all sensors for given timespan
@data_bp.route("/avg/<string:units>/<int:start>-<int:end>")
def avg(units, start, end):
	sensors = getSensors()

	#connect to postgres database
	conn, cur = pgOpen()
	response = []
	#get avg for each sensor
	for sensor in sensors:
		pgQuery(cur, start, end, sensor, col = f"AVG({units})")
		data = cur.fetchone()
		try:
			response += [{"avg": float(sum(data)/len(data)), "id": sensor}]
		except:
			print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	return json.dumps(response, indent=4)

# Average the data of given sensor for given timespan
@data_bp.route("/avg/<string:units>/<int:start>-<int:end>/<int:sensor_id>")
def avgS(units, start, end, sensor_id):
	res = "N/A"

	#connect to postgres database
	conn, cur = pgOpen()
	pgQueryAvg(cur, start, end, sensor_id, col = units)
	data = cur.fetchone()
	try:
		res = float(data[0])
	except:
		print(f"Error averaging aqi data: {data}")
	pgClose(conn, cur) 
	
	return json.dumps(res, indent=4)

#pull time, data for given timespan and sensor for plotting
@data_bp.route("/time/<string:units>/<int:start>-<int:end>/<int:sensor_id>")
def timeS(units, start, end, sensor_id):
	conn, cur = pgOpen()
	if sensor_id == 0:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units}) AS average_AQI")
		data = cur.fetchall()
	else:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units})")
		data = cur.fetchall()

	#type and pg data	
	data = [[row[0], int(row[1]) if row[1] is not None else 0] for row in data]
	#already sorted
	#data.sort(key= lambda x: (x[0], x[1]))

	#package data
	data = {"data": data}
	pgClose(conn, cur) 

	return json.dumps(data, indent=4)

#Get data averages for each sensor for past x days/hours
@data_bp.route("/sensorinfo/<string:units>/<int:sensor_id>")
def sensorinfo(units, sensor_id):	
	averages = ["6 months", "30 days", "1 week", "24 hours", "1 hour"]
	hour = 60 * 60
	day = 24 * hour
	end = datetime.now().timestamp()
	starts = [end - day*180, end - day * 30, end - day * 7, end - day * 1, end - hour]
	
	conn, cur = pgOpen()
	avgs = ["N/A" for avg in averages]

	for i, start in enumerate(starts):
		timespan = averages[i]
		#print(f"\Timespan: {timespan} — {datetime.fromtimestamp(start)} to {datetime.fromtimestamp(end)}")

		pgQueryAvg(cur, start, end, sensor_id, units)
		res = cur.fetchall()
		#print(f"Response: {res}")
		try:
			avgs[i] = round(float(res[0][0]), 2)
		except:
			print(f"Error finding {averages[i]} avg for sensor {sensor_id}, defaulting to null.") 
			avgs[i] = "N/A"
	pgClose(conn, cur)

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": averages,
		"banner_avg": avgs[-1]
	}
	return response

# Register Blueprint
app.register_blueprint(data_bp)

# RAW
#Pull raw data from given timespan and sensor
@raw_bp.route("/<int:start>-<int:end>/<string:sensor_ids>")
def get_data(start, end, sensor_ids):
    sensor_ids = [int(sid) for sid in sensor_ids.split(",")]
    conn, cur = pgOpen()

    query = """
        SELECT *
        FROM readings
        WHERE time >= %s
          AND time <= %s
          AND id = ANY(%s)
    """

    cur.execute(query, (start, end, sensor_ids))
    rows = cur.fetchall()

    pgClose(conn, cur)
    header = [desc[0] for desc in cur.description]  # column names

    #build csv string
    csv_lines = []
    csv_lines.append(",".join(header))  # header row
    for row in rows:
        csv_lines.append(",".join(str(col) for col in row))
    csv_data = "\n".join(csv_lines)

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=readings.csv"}
    )

# Register Blueprint
app.register_blueprint(raw_bp)

def test():
	with open('tests.py') as f:
		exec(f.read())

# Catch all non-API routes and serve index.html
@app.route('/', defaults={'path': ''})
@app.route('/static/<path:path>')
def serve_react_app(path):
    print("serving web build...")
    print(f"path: {path}")
    if path.startswith("static/"):
        return send_from_directory(app.static_folder, path[len("static/"):])
    return send_from_directory(app.static_folder, 'index.html')


#test()

if __name__ == "__main__":
	#Development server:
	app.run(debug=True)
