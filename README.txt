Hello and welcome to the repository. In this file I'll give you a run-down on how to get your own version of this website up and working.

To launch your own version of this website you'll need to mody the following files:
.env.template
sensor-info.json
town.geojson

You will also need to generate cert.pem and key.pem if you want the site to be accesible through https. (this is not strictly necessary, but otherwise browsers will warn you that they cannot verify the authenticity of the website)

Below are instructions for how to modify the necessary files.
.ENV.TEMPLATE: 
	Once you fill out the following properties, you should rename this file ".env" and it will be used to configure the client and server

	URL: register a domain name and replace upton-air.com with it
	WEBPAGE_TITLE: can be anything you want, this will show up as the title of the page in various places

	HOMEPAGE: can be "landing" or "dashboard", determines which page gets the base URL, in my case, which page shows up when you visit upton-air.com
	
	CHATBOT/ALERTS_ENABLED:true or false, set to false to disable optional features in case you haven't set up the API keys yet

	API Keys: follow instructions in .env.template to generate API keys

SENSOR-INFO.JSON:
	Edit this to include entries for every sensor you wish to be monitored by your webpage
	
	Each sensor should have an entry like:
	{
        	"id": "221881",
	 		This is the id the server uses for the sensor
		"pAir_id": "222089",
			This is the id purpleair uses for the sensor. Used to map new id to old if a new sensor with new purpleair ID is installed to replace an existing sensor at a location. Will default to "id" if this field is left out. 
		"name": "Memorial",
			The name of the sensor location for display on the website.
		"color": "green"
			Specify the color associated with sensor on the map and line graph.
	},

TOWN.GEOJSON:
	In order to show a town border on the map, you need to provide that border's geojson. This can be a pain to find.
	Currently the easiest way to find geojson files is at https://osm-boundaries.com/map.
	Their search bar is primitive (searching town, state doesn't work) so you may have to search for the town name and scroll through reuslts.
	Also, they require you authenticate through a free openstreetmaps account to download the file.
	 
	
