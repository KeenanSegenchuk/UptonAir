from openai import OpenAI

client = OpenAI()

assistant = client.beta.assistants.create(
	name="Job Posting Q&A Assistant",
	instructions="""
You are an assistant. Use the following SOURCE text to answer questions.
SOURCE:

(<<< paste your whole blurb here >>>)



""",
	model="gpt-4o-mini",
)

#provide some context for the current state of the website
context = """
	page: <page you are currently on>
	info: 
	      if page == dashboard
	      {
		b_avgs: [<list of averages displayed on map buttons in predetermined order>]
		s_avgs: [sensorInfo averages]
		sensor_id: <id of currently selected sensor or list of selected sensors>
		unit: <units (current unit being graphed)>
		graph: <"line" if !globalLineBool else "bar">
		lineMode: <lineMode ("units" or "sensors")>
	      }
	      if page == landing
	      {}
	      if page == alerts
	      {
		[<string:name>,
		<int:min_AQI>,
		<string:ids>,
		<int:cooldown>,
		<int:avg_window>]
	      }
	OR
	just have the assistand available on the dashboard, and either add a some compressed version of the data they are currently graphing or have it suggest how they can analyze the data based on what they ask
"""

print("Assistant ID:", assistant.id)
