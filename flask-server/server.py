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

from updateTask import fill_gaps
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

@data_bp.route("/fill_gaps/<int:start>/<int:id>/<string:api_key>")
def fill_gap_after_start(start, id, api_key):
	if api_key != os.getenv("PURPLEAIR_API_KEY"):
		return jsonify(error="Invalid purpleair api key."), 400

	gaps = fill_gaps(id, start)
	return 200 #maybe return gaps as well so i can see what's been filled without needing to look at server logs.
	

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
