import React from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import SensorInfo from "./SensorInfo";

function Button({ id, x, y, color, infoRef }) {
    const onclick = async () => {
    	var error = false;
	let data;
        try {
            data = await axios.get('http://localhost:5000/sensorinfo', {params: {sensor: id}});
        } catch(err) {
            error = true;
        } finally {
	    data = data.data;
	    console.log(data);
	}
	if(error){console.error('Error fetching data:', error);}
	else {
	    const renderedComponent = ReactDOMServer.renderToString(<SensorInfo data={data} />);
	    if(infoRef && infoRef.current) {
		//infoRef.current.innerHTML = renderedComponent;
		infoRef.current.innerHTML = JSON.stringify(data); 
	    } else {
		document.getElementById("infoBox").innerHTML = renderedComponent; 
	    }
	}
    }
    return (
        <button
            style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                top: y,
                left: x,
                backgroundColor: color,
            }}
	    onClick={onclick}
        >
            {/* Button content can be added here */}
        </button>
    );
}

export default Button;