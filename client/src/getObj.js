function getObj(obj) {
    const qualities = ["It’s a great day to be active outside.",
			"Unusually sensitive people: Consider making outdoor activities shorter and less intense. Go inside if you have symptoms such as coughing or shortness of breath.",
			"Sensitive groups: Make outdoor activities shorter and less intense. It’s OK to be active outdoors but take more breaks. Watch for symptoms such as coughing or shortness of breath. People with asthma: Follow your asthma action plan and keep quick relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider.",
			"Sensitive groups: Consider rescheduling or moving all activities inside. Go inside if you have symptoms. People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone else: Keep outdoor activities shorter and less intense. Go inside if you have symptoms.",
			"Sensitive groups: Avoid all physical activity outdoors. Reschedule to a time when air quality is better or move activities indoors.* People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone else: Limit outdoor physical activity. Go indoors* if you have symptoms.",
			"Sensitive groups: Stay indoors and keep activity levels light. Follow tips for keeping particle levels low indoors.* People with asthma: Follow your asthma action plan and keep quick-relief medicine handy. People with heart disease: Symptoms such as palpitations, shortness of breath, or unusual fatigue may indicate a serious problem. If you have any of these, contact your health care provider. Everyone: Avoid all physical activity outdoors.* *WARNING*: If it's hot out and you have no air conditioner, closing your windows can make your house dangerously hot."];

    const colors =     ["rgb(158, 255, 145)", 
			"rgb(255, 255, 0)",
			"rgb(255, 130, 0)",
			"rgb(255, 0, 0)",
			"rgb(137, 9, 151)",
			"rgb(100, 0, 21)"];

    const ranges = [50, 100, 150, 200, 300, 10000];

    let sensor_id = obj.substring(1,7);

    const positions = [
    {
        "id": "128729",
	"name": "Uxbridge",
        "x": 0,
        "y": 90,
	"color": "black"
    },
    {
        "id": "221881",
	"name": "Memorial",
        "x": 31,
        "y": 48.7,
	"color": "green"
    },
    {
        "id": "222641",
	"name": "Mendon & Grove",
        "x": 43.8,
        "y": 58.3,
	"color": "yellow"
    },
    {
        "id": "222275",
	"name": "Mendon St.",
        "x": 41.9,
        "y": 59.7,
	"color":"red"
    },
    {
        "id": "222537",
	"name": "Coach Rd. Appts.",
        "x": 24.8,
        "y": 48.8,
	"color": "blue"
    },
    {
	"id": "221859",
	"name": "Community Center",
	"x": 41.8,
	"y": 47.3,
	"color": "purple"
    },
    {
	"id": "222527",
	"name": "Victoria Dr.",
	"x": 25.4,
	"y": 52.5,
	"color": "orange"
    },
    {
        "id": "186307",
	"name": "Nipmuc HS",
        "x": 27.8,
        "y": 58.9,
	"color": "black"
    },
    {
        "id": "222529",
	"name": "Rockwood Meadows",
        "x": 68,
        "y": 29.7,
	"color": "black"
    },
    {
        "id": "222757",
	"name": "Touchstone School",
        "x": 5,
        "y": 39.2,
	"color": "black"
    }
];

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
		return qualities
	case "C":
		sensor_id = obj.substring(1,7);
		return positions[positions.findIndex(item => item.id === sensor_id)].color;
		return "src/getObj: sensor id not found.";
	case "c":
		return colors
	case "R":
	case "r":
		return ranges
	case "P":
	case "p":
		return positions
    }
    
    console.log("getObj COULD NOT RECOGNIZE OBJECT:");
    console.log("obj");
    return []
}

module.exports = { getObj };