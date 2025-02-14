import "../App.css";
function Banner({ avg }) {
    const { getObj } = require("../getObj");
    const qualities = getObj("qualities");
    const colors = getObj("c");
    const ranges = getObj("r");

    let color;
    let quality;

	
    ranges.some((range, i) => {
	if(avg<=range) {color = colors[i]; quality = qualities[i]; return true;}
	return false;
    });

    return (
        <div className="banner" style={{backgroundColor: color}}>
	    <h1>Today's Air Quality Average:</h1>
	    <h1><strong>{quality}</strong></h1>
	    <h1>({String(avg)} AQI)</h1>
        </div>
    );
}

export default Banner;