# This is our backend file
import asyncio
import json
import os
import re
import threading
import secrets as _secrets
import hmac as _hmac
import hashlib as _hashlib
import time as _time
from datetime import datetime

from flask import Flask, Blueprint, request, send_from_directory, jsonify, make_response, Response
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger

from pullfn import *
from fileUtil import getSensors, getLastTimestamp
from getByDate import *
from pgUtil import *
from updateTask import update_loop
from send_email import send_summary_email
from chatbot import send_prompt
from log import get_logger

logger = get_logger()

_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

_CSRF_SECRET = os.getenv("SECRET_KEY") or _secrets.token_hex(32)

app = Flask(__name__)
CORS(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="memory://",
    default_limits=[]  # no global limit — only explicit per-route limits
)

swagger = Swagger(app, template={
    "info": {
        "title": "UptonAir API",
        "description": "Air quality monitoring API for Upton, MA. Data sourced from PurpleAir sensors.",
        "version": "1.0.0",
    },
    "basePath": "/",
}, config={
    "headers": [],
    "specs": [{
        "endpoint": "apispec",
        "route": "/apispec.json",
        "rule_filter": lambda rule: rule.rule.startswith("/api"),
        "model_filter": lambda tag: True,
    }],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs",
})

datafile = "data.txt"


# ---------------------------------------------------------------------------
# CSRF helpers
# ---------------------------------------------------------------------------

def _check_csrf(req):
    """Return True if the X-CSRF-Token header carries a valid HMAC token."""
    try:
        token = req.headers.get("X-CSRF-Token", "")
        parts = token.split(".")
        if len(parts) != 2:
            return False
        nonce, sig = parts
        expected = _hmac.new(
            _CSRF_SECRET.encode(), nonce.encode(), _hashlib.sha256
        ).hexdigest()
        return _hmac.compare_digest(expected, sig)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Before-request logging
# ---------------------------------------------------------------------------

@app.before_request
def log_api_calls():
    if request.path.startswith('/api'):
        logger.info(
            f"[{int(datetime.utcnow().timestamp())}]"
            f"/[{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}]"
            f" API CALL: {request.method} {request.url}"
        )


# ---------------------------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------------------------

alert_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')
data_bp  = Blueprint('data',   __name__, url_prefix='/api/data')
raw_bp   = Blueprint('raw',    __name__, url_prefix='/api/raw')


# CSRF TOKEN
@app.route("/api/csrf-token", methods=["GET"])
def csrf_token():
    """
    Obtain a CSRF token to include in state-changing requests.
    ---
    tags:
      - Security
    responses:
      200:
        description: A signed CSRF token to pass as the X-CSRF-Token header.
        schema:
          type: object
          properties:
            csrf_token:
              type: string
              example: "abc123def456.<hmac-hex>"
    """
    nonce = _secrets.token_hex(16)
    sig = _hmac.new(
        _CSRF_SECRET.encode(), nonce.encode(), _hashlib.sha256
    ).hexdigest()
    token = f"{nonce}.{sig}"
    resp = jsonify({"csrf_token": token})
    resp.set_cookie("csrf_token", token, samesite="Strict", httponly=False)
    return resp


# HEALTH CHECK
@app.route("/api/health", methods=["GET"])
def health():
    """
    Check API and database health.
    ---
    tags:
      - Health
    responses:
      200:
        description: All systems operational.
        schema:
          type: object
          properties:
            status:
              type: string
              enum: [ok, degraded]
            db:
              type: string
              enum: [ok, error]
            last_fetch:
              description: Unix timestamp of the most recent sensor reading, or null.
            timestamp:
              type: integer
              description: Current server Unix timestamp.
      503:
        description: Database unavailable.
    """
    db_status = "ok"
    last_fetch = None
    try:
        conn, cur = pgOpen()
        pgClose(conn, cur)
        last_fetch = maxTimestamp()
    except Exception as e:
        logger.error(f"Health check DB error: {e}")
        db_status = "error"

    overall = "ok" if db_status == "ok" else "degraded"
    http_code = 200 if db_status == "ok" else 503
    return jsonify({
        "status": overall,
        "db": db_status,
        "last_fetch": last_fetch,
        "timestamp": int(_time.time()),
    }), http_code


# PULL ARCHIVE
@app.route("/api/full_data")
def raw_data():
    """
    Download the full sensor readings archive as CSV.
    ---
    tags:
      - Raw Data
    produces:
      - text/csv
    responses:
      200:
        description: CSV file containing all historical readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA).
    """
    with open(datafile, "r") as data:
        csv_data = data.read()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=readings.csv"}
    )

# CHATBOT
@app.post('/api/chat')
@limiter.limit("10 per minute; 100 per day")
def chat():
	"""
	Send a prompt to the AI assistant with optional session context.
	---
	tags:
	  - Chatbot
	parameters:
	  - in: body
	    name: body
	    required: true
	    schema:
	      type: object
	      properties:
	        body:
	          type: object
	          required: [prompt]
	          properties:
	            prompt:
	              type: string
	              example: "What is the current air quality in Upton?"
	            id:
	              type: string
	              description: Session ID — reuse across requests to maintain conversation context.
	              example: "abc123"
	responses:
	  200:
	    description: Chatbot response.
	    schema:
	      type: object
	      properties:
	        response:
	          type: string
	  429:
	    description: Rate limit exceeded (10 per minute or 100 per day per IP).
	"""
	payload = request.get_json().get("body")
	if isinstance(payload, str):
		payload = json.loads(payload)

	prompt = payload.get("prompt")
	logger.info(f"type: {type(prompt)}, prompt: {prompt}")
	sessionID = payload.get("id") or 0
	response = send_prompt(prompt, sessionID)
	return jsonify({"response":response})


# ALERTS
# Add new email alert to database
@alert_bp.route("/add/<string:address>/<string:name>/<string:alert_type>/<string:unit>/<int:min_AQI>/<string:ids>/<int:cooldown>/<int:avg_window>", methods=["POST"])
@limiter.limit("15 per hour")
def add_alert(address, name, alert_type, unit, min_AQI, ids, cooldown, avg_window):
	"""
	Subscribe an email address to an air quality alert.
	---
	tags:
	  - Alerts
	parameters:
	  - name: address
	    in: path
	    type: string
	    required: true
	    description: Email address to notify.
	    example: user@example.com
	  - name: name
	    in: path
	    type: string
	    required: true
	    description: Unique name for this alert (must be unique per email address).
	    example: my-alert
	  - name: alert_type
	    in: path
	    type: string
	    required: true
	    enum: [avg, any]
	    description: >
	      "avg" triggers when the average of all selected sensors exceeds the threshold.
	      "any" triggers when any single selected sensor exceeds the threshold.
	  - name: unit
	    in: path
	    type: string
	    required: true
	    enum: [AQI, AQIEPA, PMA, PMB, PMEPA, humidity, PM]
	    description: The measurement column to compare against the threshold.
	  - name: min_AQI
	    in: path
	    type: integer
	    required: true
	    description: Threshold value that triggers the alert.
	    example: 100
	  - name: ids
	    in: path
	    type: string
	    required: true
	    description: Comma-separated sensor IDs to monitor, or "All" for every sensor.
	    example: "1,2,3"
	  - name: cooldown
	    in: path
	    type: integer
	    required: true
	    description: Minimum hours between alert emails.
	    example: 24
	  - name: avg_window
	    in: path
	    type: integer
	    required: true
	    description: Averaging window in minutes (rounded to nearest 10).
	    example: 60
	responses:
	  200:
	    description: Alert added successfully.
	  400:
	    description: Invalid email address, duplicate alert name, or invalid unit.
	  403:
	    description: CSRF validation failed.
	  429:
	    description: Rate limit exceeded (5 per hour per IP).
	  500:
	    description: Unknown database error.
	"""
	if not _check_csrf(request):
		return jsonify(error="CSRF validation failed."), 403
	if not _EMAIL_RE.match(address):
		return jsonify(error="Invalid email address."), 400
	if unit not in ALLOWED_UNITS:
		return jsonify(error=f"Invalid unit '{unit}'."), 400
	if ids == "All":
		ids = [id for id in getSensors() if id != 0]
	else:
		ids = [int(id) for id in ids.split(",")]
	DATA_ROW = (address, name, alert_type, unit, min_AQI, ids, cooldown, avg_window, 0, 0) #a row of data has this format, the two 0s are the last time an alert has been issued to the given contact address, and how many times this alert has been triggered

	conn, cur = pgOpen()

	#check for table
	if not pgCheck(cur, "alerts"):
		logger.warning("Alert table not found when trying to add alert.")

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
@alert_bp.route("/remove/<string:address>/<string:name>/", methods=["POST"])
@alert_bp.route("/remove/<string:address>/<string:name>", methods=["POST"])
@limiter.limit("10 per hour")
def remove_alert(address, name):
	"""
	Unsubscribe from an air quality alert by email and alert name.
	---
	tags:
	  - Alerts
	parameters:
	  - name: address
	    in: path
	    type: string
	    required: true
	    description: Email address associated with the alert.
	    example: user@example.com
	  - name: name
	    in: path
	    type: string
	    required: true
	    description: >
	      Name of the alert to remove.
	      Pass "ALERT_SUMMARY" to receive a summary email of all active alerts instead of removing one.
	    example: my-alert
	responses:
	  200:
	    description: Alert removed successfully, or summary email sent.
	  400:
	    description: No alert found for the given email and name.
	  403:
	    description: CSRF validation failed.
	  429:
	    description: Rate limit exceeded (10 per hour per IP).
	  500:
	    description: Unknown database error.
	"""
	if not _check_csrf(request):
		return jsonify(error="CSRF validation failed."), 403

	logger.info(f"Removing Alert: {address}, {name}")

	conn, cur = pgOpen()

	if name == "ALERT_SUMMARY":
		summary_alerts = pgListAlerts(cur, address)
		send_summary_email(summary_alerts, address)
		return (jsonify(message=f"Sent summary email to {address}."), 200)

	if not pgCheck(cur, "alerts"):  	#check for table
		logger.warning("Alert table not found when trying to add alert.")

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
	"""
	Get the average reading of every sensor for a time range.
	---
	tags:
	  - Data
	parameters:
	  - name: units
	    in: path
	    type: string
	    required: true
	    enum: [AQI, AQIEPA, PMA, PMB, PMEPA, humidity, PM]
	  - name: start
	    in: path
	    type: integer
	    required: true
	    description: Start of time range as a Unix timestamp.
	  - name: end
	    in: path
	    type: integer
	    required: true
	    description: End of time range as a Unix timestamp.
	responses:
	  200:
	    description: List of per-sensor average values.
	    schema:
	      type: array
	      items:
	        type: object
	        properties:
	          id:
	            type: integer
	            description: Sensor ID.
	          avg:
	            type: number
	            description: Average reading for the time range.
	  400:
	    description: Invalid unit.
	"""
	if units not in ALLOWED_UNITS:
		return jsonify(error=f"Invalid unit '{units}'."), 400
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
		except Exception as e:
			logger.error(f"Error averaging data for sensor {sensor}: {e}")
	pgClose(conn, cur)

	return json.dumps(response, indent=4)

# Average the data of given sensor for given timespan
@data_bp.route("/avg/<string:units>/<int:start>-<int:end>/<int:sensor_id>")
def avgS(units, start, end, sensor_id):
	"""
	Get the average reading of a single sensor for a time range.
	---
	tags:
	  - Data
	parameters:
	  - name: units
	    in: path
	    type: string
	    required: true
	    enum: [AQI, AQIEPA, PMA, PMB, PMEPA, humidity, PM]
	  - name: start
	    in: path
	    type: integer
	    required: true
	    description: Start of time range as a Unix timestamp.
	  - name: end
	    in: path
	    type: integer
	    required: true
	    description: End of time range as a Unix timestamp.
	  - name: sensor_id
	    in: path
	    type: integer
	    required: true
	    description: Sensor ID. Use 0 for the town-wide average.
	responses:
	  200:
	    description: Average value as a float, or the string "N/A" if no data exists for the range.
	  400:
	    description: Invalid unit.
	"""
	if units not in ALLOWED_UNITS:
		return jsonify(error=f"Invalid unit '{units}'."), 400
	res = "N/A"

	#connect to postgres database
	conn, cur = pgOpen()
	pgQueryAvg(cur, start, end, sensor_id, col = units)
	data = cur.fetchone()
	try:
		res = float(data[0])
	except Exception as e:
		logger.error(f"Error averaging aqi data: {e}")
	pgClose(conn, cur)

	return json.dumps(res, indent=4)

#pull time, data for given timespan and sensor for plotting
@data_bp.route("/time/<string:units>/<int:start>-<int:end>/<int:sensor_id>")
def timeS(units, start, end, sensor_id):
	"""
	Get time-series readings for a sensor over a time range, for graphing.
	---
	tags:
	  - Data
	parameters:
	  - name: units
	    in: path
	    type: string
	    required: true
	    enum: [AQI, AQIEPA, PMA, PMB, PMEPA, humidity, PM]
	  - name: start
	    in: path
	    type: integer
	    required: true
	    description: Start of time range as a Unix timestamp.
	  - name: end
	    in: path
	    type: integer
	    required: true
	    description: End of time range as a Unix timestamp.
	  - name: sensor_id
	    in: path
	    type: integer
	    required: true
	    description: Sensor ID. Use 0 for the town-wide average across all sensors.
	responses:
	  200:
	    description: Object containing a list of [timestamp, value] pairs ordered by time.
	    schema:
	      type: object
	      properties:
	        data:
	          type: array
	          items:
	            type: array
	            example: [1724187600, 42]
	  400:
	    description: Invalid unit.
	"""
	if units not in ALLOWED_UNITS:
		return jsonify(error=f"Invalid unit '{units}'."), 400
	conn, cur = pgOpen()
	if sensor_id == 0:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units}) AS average_AQI")
		data = cur.fetchall()
	else:
		pgQuery(cur, start, end, sensor_id, f"time, AVG({units})")
		data = cur.fetchall()

	#type and pg data
	data = [[row[0], int(row[1]) if row[1] is not None else 0] for row in data]

	#package data
	data = {"data": data}
	pgClose(conn, cur)

	return json.dumps(data, indent=4)

#Get data averages for each sensor for past x days/hours
@data_bp.route("/sensorinfo/<string:units>/<int:sensor_id>/<string:timeframes>/<string:starts>")
def sensorinfo(units, sensor_id, timeframes, starts):
	"""
	Get pre-formatted averages across multiple timeframes for a single sensor.
	Used to populate the sensor info sidebar on the dashboard.
	---
	tags:
	  - Data
	parameters:
	  - name: units
	    in: path
	    type: string
	    required: true
	    enum: [AQI, AQIEPA, PMA, PMB, PMEPA, humidity, PM]
	  - name: sensor_id
	    in: path
	    type: integer
	    required: true
	    description: Sensor ID. Use 0 for the town-wide average.
	  - name: timeframes
	    in: path
	    type: string
	    required: true
	    description: Comma-separated list of human-readable timeframe labels (e.g. "1hr,24hr,7day").
	    example: "1hr,24hr,7day,30day"
	  - name: starts
	    in: path
	    type: string
	    required: true
	    description: Comma-separated Unix timestamps marking the start of each timeframe. The last value is used as the banner average.
	    example: "1724184000,1724101200,1723582800,1721494800"
	responses:
	  200:
	    description: Sensor averages for each requested timeframe plus a banner average.
	    schema:
	      type: object
	      properties:
	        id:
	          type: integer
	        avgs:
	          type: array
	          description: Average for each timeframe except the last (which becomes banner_avg).
	          items:
	            type: number
	        inputs:
	          type: array
	          description: Timeframe labels passed in.
	          items:
	            type: string
	        banner_avg:
	          description: Average for the last timeframe, displayed prominently in the UI.
	  400:
	    description: Invalid unit.
	"""
	if units not in ALLOWED_UNITS:
		return jsonify(error=f"Invalid unit '{units}'."), 400
	end = datetime.now().timestamp()
	starts = starts.split(",")
	timeframes = timeframes.split(",")

	conn, cur = pgOpen()
	avgs = ["N/A" for avg in starts]

	for i, start in enumerate(starts):
		pgQueryAvg(cur, start, end, sensor_id, units)
		res = cur.fetchall()
		try:
			avgs[i] = round(float(res[0][0]), 2)
		except Exception as e:
			logger.error(f"Error finding {timeframes[i]} avg for sensor {sensor_id}, defaulting to N/A: {e}")
			avgs[i] = "N/A"
	pgClose(conn, cur)

	response = {
		"id": sensor_id,
		"avgs": avgs[:-1],
		"inputs": timeframes,
		"banner_avg": avgs[-1]
	}
	return response

# Register Blueprint
app.register_blueprint(data_bp)

# RAW
#Pull raw data from given timespan and sensor
@raw_bp.route("/<int:start>-<int:end>/<string:sensor_ids>")
def get_data(start, end, sensor_ids):
    """
    Download raw readings for one or more sensors over a time range as CSV.
    ---
    tags:
      - Raw Data
    produces:
      - text/csv
    parameters:
      - name: start
        in: path
        type: integer
        required: true
        description: Start of time range as a Unix timestamp.
      - name: end
        in: path
        type: integer
        required: true
        description: End of time range as a Unix timestamp.
      - name: sensor_ids
        in: path
        type: string
        required: true
        description: Comma-separated list of sensor IDs.
        example: "1,2,3"
    responses:
      200:
        description: CSV file with columns time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA.
    """
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

# Catch all non-API routes and serve index.html
@app.route('/', defaults={'path': ''})
@app.route('/static/<path:path>')
def serve_react_app(path):
    logger.info("serving web build...")
    logger.info(f"path: {path}")
    if path.startswith("static/"):
        return send_from_directory(app.static_folder, path[len("static/"):])
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == "__main__":
	#Development server:
	app.run(debug=True)
