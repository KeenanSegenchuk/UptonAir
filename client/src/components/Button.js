import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";
import "../App.css";

function Button({ id, val, x, y, updateSensor }) {    
    const ranges = getObj("r");
    const colors = getObj("c");
    const name = getObj("$" + id);
    const labelOffsets = getObj("O" + id);
    const scale = [1020, 723];
    const { globalLineBool, hover } = useAppContext();
    const [toggle, setToggle] = useState(false);
    const [borderStyle, setBorderStyle] = useState("none");
    const [bhover, setbHover] = useState(false);
    const hoverKey = "labels";

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
	setbHover(true);
    };
    const hideName = () => {
	setbHover(false);
    };

    const labelStyle = {
      position: "absolute",
      fontSize: '10px', // small text
      fontWeight: 'bold', // bold text
      backgroundColor: '#f4e1a1', // manila color (a soft yellow)
      padding: '0', // no padding
      margin: '0', // no margins
      top: (y+labelOffsets[1])+"%",
      left: (x+labelOffsets[0])+"%",
      whiteSpace:"nowrap",
      width:`${name.length * 6.5}px`,
      zIndex:9
    };

    return (
        <div title={name} style={{top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
            <button
		className="mapButton"
                type="button"
                id={id}
		onMouseOver={showName}
		onMouseOut={hideName}
                style={{
		    backgroundColor: color,
		    outline: borderStyle,
                    top: y+"%",
                    left: x+"%",
		    zIndex: 10,
                }}
                onClick={(event) => handleButtonClick(id, event)}  
            >
                {Math.round(val)}
                {/* Button content can be added here */}
            </button>
	    {(hover==hoverKey || bhover) ? (
		<input type="text" placeholder={name} style={labelStyle}/>
	    ):null}
        </div>
    );
}

export default Button;
