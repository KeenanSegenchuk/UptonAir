import "../App.css";
function Banner({ avg }) {
    const { getObj } = require("../getObj");
    const qualities = getObj("qualities");
    const colors = getObj("v");
    const textColors= getObj("t");
    const ranges = getObj("r");

    let color;
    let textColor
    let quality;

	
    ranges.some((range, i) => {
	if(avg<=range) {textColor = textColors[i]; color = colors[i]; quality = qualities[i]; return true;}
	return false;
    });

    return (
        <div className="banner" style={{backgroundColor: color, color:textColor}}>
	    <h1>Last Hour's Air Quality Average:</h1>
	    <h1>({String(avg)} AQI)</h1>
	    <h1><strong>{quality}</strong></h1>
        </div>
    );
}

export default Banner;