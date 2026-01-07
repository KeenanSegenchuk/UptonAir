import positions from "./sensor-pos.json";
export function getObj(obj) {

    //enable logs
    const l = false;

    const qualities = ["Air quality is impossibly good, this is showing up because an error occured or the sensor has no readings in this timeframe.",
			"It’s a great day to be active outside.",
			"Unusually sensitive people: Consider making outdoor activities shorter and less intense. Go inside if you have symptoms such as coughing or shortness of breath.",
			"Sensitive groups: Make outdoor activities shorter and less intense. It’s OK to be active outdoors but take more breaks. Watch for symptoms such as coughing or shortness of breath. People with asthma: Follow your asthma action plan and keep quick relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider.",
			"Sensitive groups: Consider rescheduling or moving all activities inside. Go inside if you have symptoms. People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone else: Keep outdoor activities shorter and less intense. Go inside if you have symptoms.",
			"Sensitive groups: Avoid all physical activity outdoors. Reschedule to a time when air quality is better or move activities indoors.* People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone else: Limit outdoor physical activity. Go indoors* if you have symptoms.",
			"Sensitive groups: Stay indoors and keep activity levels light. Follow tips for keeping particle levels low indoors.* People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone: Avoid all physical activity outdoors.* *WARNING*: If it's hot out and you have no air conditioner, closing your windows can make your house dangerously hot."];

    const colors =     ["rgb(250, 250, 240)",
			"rgb(158, 255, 145)", 
			"rgb(255, 255, 0)",
			"rgb(255, 130, 0)",
			"rgb(255, 0, 0)",
			"rgb(137, 9, 151)",
			"rgb(100, 0, 21)"];
    const vibrColors = ["rgb(250, 250, 240)",
			"rgb(0,228,0)",
			"rgb(255,255,0)",
			"rgb(255,126,0)",
			"rgb(255,0,0)",
			"rgb(143,63,151)",
			"rgb(126,0,35)"];
    const textColors = ["black",
			"black",
			"black",
			"black",
			"black",
			"white",
			"white"];

    const ranges = [-50, 50, 100, 150, 200, 300, 10000];

    const dataContexts={
	  "6-Month": 6 * 30 * 86400,
	  "30-Day": 30 * 86400,
	  "7-Day": 7 * 86400,
	  "24-Hour": 1 * 86400,
	};

    let sensor_id = obj.substring(1,7);

    const units = {
	"AQIEPA":"AQI",
	"AQI":"AQI",
	"PMEPA":"µg/m³",
	"PM":"µg/m³",
	"PMA":"µg/m³",
	"PMB":"µg/m³",
	"percent_difference":"%",
	"humidity":"%",
    };
    const unitDescriptions = {
	"PMEPA":"EPA Calibrated PM2.5",
	"PM":"Unadjusted PM2.5",
	"PMA":"Unadjusted PM2.5 Channel A",
	"PMB":"Unadjusted PM2.5 Channel B",
	"AQIEPA":"EPA Calibrated AQI",
	"AQI":"Unadjusted AQI",
	"humidity":"Humidity",
	"percent_difference":"PM2.5 Channel Difference",
    };
    const unitColors = {
	AQIEPA:"black",
	AQI:"darkgrey",
	PMEPA:"darkblue",
	PM:"mediumAquaMarine",
	PMA:"goldenrod",
	PMB:"indianred",
	humidity: "mediumpurple",
	percent_difference: "saddlebrown"
    };

    /*
    Relic from when sensors were manually positioned. Now this data is stored in the config and lat/long are pulled from purpleair.
    const positionsOld = [
    {
        "id": "128729",
	"name": "Uxbridge",
        "x": 0,
        "y": 97,
	"xLabelOffset": 0,
	"yLabelOffset": -2,
	"color": "black"
    },
    {
        "id": "221881",
	"name": "Memorial",
        "x": 38,
        "y": 53.7,
	"xLabelOffset": -1,
	"yLabelOffset": -1.75,
	"color": "green"
    },
    {
        "id": "222641",
	"name": "Mendon & Grove",
        "x": 53.8,
        "y": 63.7,
	"xLabelOffset": 0,
	"yLabelOffset": -1.75,
	"color": "khaki"
    },
    {
        "id": "222275",
	"name": "Kiwanis Stoplight",
        "x": 50.5,
        "y": 42.2,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color":"red"
    },
    {
        "id": "222537",
	"name": "Coach Rd. Appts.",
        "x": 30.7,
        "y": 53.7,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color": "blue"
    },
    {
	"id": "221859",
	"name": "Community Center",
	"x": 50.5,
	"y": 52.5,
	"xLabelOffset": 3,
	"yLabelOffset": 0,
	"color": "purple"
    },
    {
	"id": "222527",
	"name": "Victoria Dr.",
	"x": 31,
	"y": 59,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color": "orange"
    },
    {
        "id": "221905",
	"name": "Nipmuc HS",
        "x": 34,
        "y": 63.9,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color": "slateblue"
    },
    {
        "id": "222529",
	"name": "Rockwood Meadows",
        "x": 84,
        "y": 34.5,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color": "sienna"
    },
    {
        "id": "222757",
	"name": "Touchstone School",
        "x": 8,
        "y": 41,
	"xLabelOffset": 0,
	"yLabelOffset": 2,
	"color": "brown"
    },
    {
        "id": "222531",
	"name": "BVT HS",
        "x": 36,
        "y": 60,
	"xLabelOffset": 0,
	"yLabelOffset": -1.9,
	"color": "cyan"
    },
    {
	"id": "0",
	"name": "Upton Town Average",
	"color": "white",
	"x": 0,
	"y": 0,
	"xLabelOffset": 0,
	"yLabelOffset": 2
    }
    ];
    */



    /* CODES *//*
	call getObj(code) to access static objects stored in this file
	
	$ + <id> : get name for given sensor id
	Q / q : get list of text descriptions of the air quality ranges
	C + <id> : get color assigned to the line and button highlight of a sensor
	c : get list of AQI colors
	T / t : get list of text colors used to make white text for more contrast on high-AQI dark-colored backgrounds
	X + <aqi value> : get vibrant AQI color for the range of a given value
	V / v : get list of vibrant AQI range colors
	R / r : get list of upper bounds of AQI ranges
	P / p : get list of positions of sensors on the map
	D / d : get list of timeframes available for plotting on Graph
	O / o + <id> : get info object contianing id, name, x, y, label offsets (for map button labels), and that sensor's color on the line graph 
	
    */

    let match;
    let val = -1;
    let unit = "";
    let AQindex = -1;

    const log = (txt, val) => {
	if(!l) return;
	if(val)
		console.log(txt,val);
	else
		console.log(txt);
    };

    switch (obj.substring(0,1)) {
        
	case "$":
		sensor_id = obj.substring(1,7);
		//log("$",sensor_id);
		let sensor = positions.find(sensor => sensor.id.trim() === sensor_id.trim());
		if (sensor) {
		  return sensor.name;}
 
		return "src/getObj: sensor id not found.";
	case "Q":
		//get quality description for given reading value and units
		match = obj.match(/^Q(-?[\d.]+)([a-zA-Z%μ_]*)$/);

		if(match) {
			val = parseFloat(match[1]);
			unit = match[2];
			AQindex = ranges.findIndex(item => item > val);
			if(unit.includes("AQI"))
			{	return qualities[AQindex];	}
			return "";
		} else {
			console.warn("Invalid getObj query:", obj);
			return "";
		}
	case "q":
		return qualities;
	case "C":
		sensor_id = obj.substring(1,7);
		return positions[positions.findIndex(item => item.id === sensor_id)].color;
	case "c":
		return colors;
	case "T":
		//get text color for given reading value and units
		match = obj.match(/^T(-?[\d.]+)([a-zA-Z%μ_]*)$/);

		if(match) {
			val = parseFloat(match[1]);
			unit = match[2];
			AQindex = ranges.findIndex(item => item > val);
			if(unit.includes("AQI"))
			{	return textColors[AQindex];	}
			return "black";
		} else {
			console.warn("Invalid getObj query:", obj);
			return "black";
		}
	case "t":
		return textColors;
	case "X": 
		//get color for given reading value and units
		match = obj.match(/^X(-?[\d.]+)([a-zA-Z%μ_]*)$/);

		if(match) {
			val = parseFloat(match[1]);
			unit = match[2];
			AQindex = ranges.findIndex(item => item > val);
			if(unit.includes("AQI"))
			{	return colors[AQindex];	}
			if(unit.includes("PM"))
			{	return "aqua";		}
			else 
			{	return Math.abs(val) > 100 ? "rgb(255,0,0)" : 
				Math.abs(val) <= 50 ? "rgb(0,228,0)" : "rgb(255,255,0)";	}
		} else {
			console.warn("Invalid getObj query:", obj);
			return "rgb(250, 250, 240)";
		}
	case "W":
	case "w":
		unit = obj.substring(1);
		log("Fetching unit description:", unit);
		try{
			return unitDescriptions[unit];
		} catch {
			return;
		}
	case "U":
		unit = obj.substring(2);
		switch (obj.substring(1,2)) {
			case "C":
				return unitColors[unit] ;
			case "c":
				return unitColors;
			case "D":
				return unitDescriptions[unit];
			case "d":
				return unitDescriptions;
		}
		unit = obj.substring(1);
		log("Fetching Units:", unit);
		try{
			return units[unit];
		} catch {
			return;
		}
	case "u":
		unit = obj.substring(2);
		switch (obj.substring(1,2)) {
			case "C":
				return unitColors[unit] ;
			case "c":
				return unitColors;
			case "D":
				return unitDescriptions[unit];
			case "d":
				return unitDescriptions;
		}
		return units;
	case "S":
	case "s":
		return positions.map(entry => entry.id);
	case "V":
	case "v":
		return vibrColors;
	case "R":
	case "r":
		return ranges;
	case "P":
	case "p":
		return positions;
	case "D":
	case "d":
		return dataContexts;
	case "O":
	case "o":
		sensor_id = obj.substring(1,7);
		let object = positions.find(sensor => sensor.id.trim() === sensor_id.trim());
		if (object) {
			return [object.xLabelOffset, object.yLabelOffset];}
		break;
	default:   
    		console.log("getObj COULD NOT RECOGNIZE OBJECT:");
    		console.log("obj");
    		return []
    }


} 
