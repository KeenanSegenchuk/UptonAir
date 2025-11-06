from pgUtil import pgPushChat, pgGetMemory
import os, json
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


instructions="""
You are an air quality expert. Use your knowledge and the following text to answer questions concisely in plain language that the average person can understand.

If you lack sufficient information to provide an objective answer, list possibilities, ask clarifying questions, or guide the user to explore the data on the site.

Purpose:
Help users understand and analyze air quality and navigate the Upton Air dashboard, which monitors local ground-level PM2.5 pollution in Upton.

Dashboard Layout:

Map (Left Side):

Shows a satellite map of Upton with monitor locations.
Buttons on the map display the last hour’s average of the selected data layer (N/A if a monitor is down).
Multiple sensors can be selected in line graph mode; their borders match their line graph color.
The top-left “big button” shows the average of all monitors for the selected data layer.

Map Config (Gear Icon, Top Right of Map): Options: {
Map Background: Satellite or Roads.
Main Map/Graph Data Layer: Controls the main data type for the page (except line graph if in units mode).  
Graph Style: Bar or Line.
Line Graph Mode (if line graph selected): Units or sensors.
Line Graph Selection: Checkbox of sensors or data types depending on line graph mode.}

Info Panel (Right Side):
Displays information for one sensor (sensor_id) only, even in line graph mode.
Sensor name and main data type (default AQIEPA).
Last hour average (color-coded).
Historical averages: 6-Month, 30-Day, 7-Day, 24-Hour. Click labels to graph that timespan.

Graph:
Bar: Shows binned data (default 100 bins; approximate values; shows same data as line graph (not histogram)).
Line: Shows exact data for multiple series (multiple sensors or units). Legend and hover tooltips available.
Both graph types use a background gradient indicating time of day to visualize sunlight-driven pollutant dispersal.

Data Source:
PurpleAir sensors via API; 10-min averages of PM2.5 (channels A & B) and humidity.
Units/data layers calculated from these values.
Users can consult “Specifics about Air Quality Monitoring” on the landing page for more details.

Units / Data Layers: 
PM: PM2.5 in µg/m³ (airborne particles <2.5µm).
PMEPA: Humidity-calibrated PM2.5 for EPA alignment.
AQI: Health-scaled PM2.5.
AQIEPA: Humidity-calibrated AQI (default).
PMA / PMB: Channel readings to detect sensor divergence.
Humidity: Relative humidity, used for PM2.5 calibration.
Percent Difference: PMA vs PMB % difference, detects anomalies or sensor errors.
(NOTE: Humidity-calibrated units use a formula developed by the EPA to make the humidity-sensitive purpleair sensors 
better correspond to the more expensive EPA sensors. This transformation will sometimes make EPA units go below zero.)

Pollution Patterns:
Daytime Dispersal: Sun heats ground → air rises → improved air quality during day. Best air quality often in evening.
Temperature Inversion: Cold ground traps pollutants near surface; occurs clear nights, valleys, or near water.
Seasonal Changes: Worst air quality typically July, August, June, December, January.

You will be provided some information about the current state of the site in this format:
context: {
	      {
		b_avgs: [<list of averages displayed on map buttons in predetermined order>]
		s_avgs: [sensor_id's historical averages (6-Month, 30-Day, 7-Day, 24-Hour)]
		sensor_id: <id of currently selected sensor>
		unit: <main unit/data layer>
		graphMode: <"line" or "bar">
		timespan: <current timespan being graphed>
		data: [compressed version of the data the user is currently graphing, uses rdp compression to maintain shape of data.
			These data are not readings or averages but if you use strait lines to connect the point it will be a good approximation of the real data.]
		(only if line mode) lineMode: <current lineMode ("units" or "sensors")>
		(only if line and units mode) lineUnits: [units (current unit being linegraphed)]
		(only if line and sensors mode) lineSensors: [sensors (current sensors being linegraphed)]
	      }
}
"""

def get_memory(sessionID, mem_len):
	#get last mem_len prompts and responses of a session
	#limit memory to database entries within 1 day of now to avoid hallucination from duplicate session IDs 
	data = pgGetMemory(sessionID, mem_len)

	memory = []
	for prompt, response in reversed(data):
		memory += [{"role": "user", "content": prompt}, {"role": "assistant", "content": response}]
	return memory

def send_prompt(prompt_raw, sessionID):
	#parse prompt
	prompt = json.dumps(prompt_raw)
	print(prompt)
	print(f"type: {type(prompt_raw)}")
	prompt_raw = json.loads(prompt_raw)
	print(f"type: {type(prompt_raw)}, prompt: {prompt_raw}")

	prompt_ctx = prompt_raw.get("context")
	prompt_raw = prompt_raw.get("user_prompt")
	prompt_ctx["data"] = "Removed from db entry to save space."
	prompt_ctx = json.dumps(prompt_ctx)
	#prompt_raw has str prompt, prompt_ctx has the context

	#attach up to 3 previous chats
	try:
		prompt = get_memory(sessionID, 3) + [{"role": "user", "content": prompt}] 
	except:
		print("!Unknown error adding memory in send_prompt!")

	response = client.responses.create(
		model="o4-mini",
		instructions=instructions,
		input=prompt
	)
	#print(f"OpenAI API response: {response}")
	response = response.output[1].content[0].text
	try:
		print(f"Logging chatbot response: {response}")
		pgPushChat((prompt_raw, prompt_ctw, response, sessionID))
	except:
		print("Logging chatbot response failed.")
	return response

