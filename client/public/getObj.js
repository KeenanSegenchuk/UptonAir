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

    const positions = [
    {
        "id": "128729",
	"name": "Uxbridge",
        "x": 0,
        "y": 90
    },
    {
        "id": "221881",
	"name": "Memorial",
        "x": 31,
        "y": 48.7
    },
    {
        "id": "222641",
	"name": "Mendon & Grove",
        "x": 51.5,
        "y": 63
    },
    {
        "id": "222275",
	"name": "Mendon St.",
        "x": 49.3,
        "y": 64
    },
    {
        "id": "222537",
	"name": "Coach Rd. Appts.",
        "x": 33,
        "y": 54.2
    },
    {
	"id": "221859",
	"name": "Community Center",
	"x": 50.4,
	"y": 52.3
    },
    {
	"id": "222527",
	"name": "Victoria Dr.",
	"x": 32.9,
	"y": 57
    },
    {
        "id": "186307",
	"name": "Nipmuc HS",
        "x": 33,
        "y": 54.2
    },
    {
        "id": "222529",
	"name": "Rockwood Meadows",
        "x": 33,
        "y": 54.2
    },
    {
        "id": "222757",
	"name": "Touchstone School",
        "x": 33,
        "y": 54.2
    }
];

    switch (obj.substring(0,1)) {
	case "q":
		return qualities
	case "c":
		return colors
	case "r":
		return ranges
	case "p":
		return positions
    }
    
    console.log("getObj COULD NOT RECOGNIZE OBJECT:");
    console.log("obj");
    return []
}

module.exports = { getObj };