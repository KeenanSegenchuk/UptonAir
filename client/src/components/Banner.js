import "../App.css";
function Banner({ avg, units }) {
    const { getObj } = require("../getObj");
    const qualities = getObj("qualities");
    const colors = getObj("c");
    const textColors= getObj("t");
    const ranges = getObj("r");

    let color;
    let textColor
    let quality;
    let unit;

    color = getObj(`X${avg}${units}`);
    textColor = getObj(`T${avg}${units}`);
    quality = getObj(`Q${avg}${units}`);
    unit = getObj(`U${units}`);
	
    /*ranges.some((range, i) => {
	if(avg<=range) {textColor = textColors[i]; color = colors[i]; quality = qualities[i]; return true;}
	return false;
    });*/


    return (
        <div id="Banner.js" className="banner" style={{backgroundColor: color, color:textColor}}>
	    <h1 className="bannerText">Last Hour's Air Quality Average:</h1>
	    <h1 className="bannerText">({String(avg)} {unit})</h1>
	    <h1 className="bannerText"><strong>{quality}</strong></h1>
        </div>
    );
}

export default Banner;