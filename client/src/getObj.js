import positions from "./sensor-pos.json";
export function getObj(obj) {
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

    const ranges = [0, 50, 100, 150, 200, 300, 10000];

    const dataContexts={
	  "6-Month": { secs: 6 * 30 * 86400 },
	  "30-Day": { secs: 30 * 86400 },
	  "7-Day": { secs: 7 * 86400 },
	  "24-Hour": { secs: 1 * 86400 },
	};

    let sensor_id = obj.substring(1,7);


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

    switch (obj.substring(0,1)) {
	case "$":
		sensor_id = obj.substring(1,7);
		//console.log(sensor_id);
		let sensor = positions.find(sensor => sensor.id.trim() === sensor_id.trim());
		if (sensor) {
		  return sensor.name;}
 
		return "src/getObj: sensor id not found.";
	case "Q":
	case "q":
		return qualities;
	case "C":
		sensor_id = obj.substring(1,7);
		return positions[positions.findIndex(item => item.id === sensor_id)].color;
	case "c":
		return colors;
	case "T":
	case "t":
		return textColors;
	case "X": 
		const value = parseFloat(obj.substring(1,7));
		//console.log("GETOBJ  X VALUE:", value);
		const index = ranges.findIndex(item => item > value);
		//console.log("RETURNING COLOR FROM GETOBJ", vibrColors[index]);
		return vibrColors[index];
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
//module.exports = { getObj };