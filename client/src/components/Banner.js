function Banner({ avg }) {
    let color;
    let quality;

    if (avg < 5) {
	color = "green";
	quality = "Good";
    } else if (avg < 12.5) {
	color = "yellow";
	quality = "Mild";
    } else if (avg < 25) {
	color = "orange";
	quality = "Not Good";
    } else {
	color = "red";
	quality = "Bad";
    }
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