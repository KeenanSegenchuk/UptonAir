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
        <div className="banner" style={{
                width: '100%',
                height: '30%',
		textAlign: 'center',
                backgroundColor: color,
                border: '5px solid black',
            }}
	>
	    <h1>Today's Air Quality:</h1>
	    <h1><strong>{quality}</strong></h1>
	    <h1>({String(avg)} µg/m<sup>3</sup>)</h1>
        </div>
    );
}

export default Banner;