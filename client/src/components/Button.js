import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function Button({ id, val, x, y, updateSensor }) {    
    const ranges = getObj("r");
    const colors = getObj("c");
    const name = getObj("$" + id);
    const { globalLineBool } = useAppContext();
    const [toggle, setToggle] = useState(false);
    const [borderStyle, setBorderStyle] = useState("none");
    const [hover, setHover] = useState(false);

    // Calculate the color based on val
    let color = "default";
    for (let i = 0; i < ranges.length; i++) {
        if (val < ranges[i]) {
            color = colors[i];
            break;
        }
    }

    const handleButtonClick = (sensorValue, event) => {
        if (globalLineBool) {
	    if (toggle) {
		setBorderStyle("none");
	    }
	    else {
            	const borderColor = getObj("C" + id);
            	setBorderStyle("5px solid " + borderColor);
	    }
	    setToggle(!toggle);
        }
        event.preventDefault(); 
        updateSensor(sensorValue); 
    };

    const showName = () => {
	setHover(true);
    };
    const hideName = () => {
	setHover(false);
    };

    return (
        <div title={name}>
            <button
                type="button"
                id={id}
		onmouseover="showName()"
		onmouseout="hideName()"
                style={{
                    position: 'absolute',
                    width: '17px',
                    height: '17px',
                    borderRadius: '50%',
                    top: Math.round(y * 1020 / 100),
                    left: Math.round(x * 723 / 100),
                    backgroundColor: color, 
                    textAlign: "center",
                    alignItems: "center",
		    border: "none",
                    outline: borderStyle,
                    fontSize: ".6em",
		    cursor: "pointer",
                }}
                onClick={(event) => handleButtonClick(id, event)}  
            >
                {Math.round(val)}
                {/* Button content can be added here */}
            </button>
	    {hover && (
		<div><input type="text" placeholder={name}/></div>
	    )}
        </div>
    );
}

export default Button;
