import React, { useState } from 'react';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";
import "../App.css";

function Button({ id, val, x, y, updateSensor }) {    
    const ranges = getObj("r");
    const colors = getObj("c");
    const name = getObj("$" + id);
    const labelOffsets = getObj("O" + id);
    const { globalLineBool, hover } = useAppContext();
    const [borderStyle, setBorderStyle] = useState("none");
    const [bhover, setbHover] = useState(false);
    const hoverKey = "labels";

    const {dataContext} = useAppContext();
    const contexts = getObj("DataContexts");
    const [contextToggles, setContextToggles] = useState(new Array(contexts.length).fill(false));


    // Calculate the color based on val
    let color = "default";
    for (let i = 0; i < ranges.length; i++) {
        if (val < ranges[i]) {
            color = colors[i];
	    if(i === 0)
		val = -1;
            break;
        }
    }

    const handleButtonClick = (sensorValue, event) => {
        if (globalLineBool) {
	    const cidx = contexts.indexOf(dataContext);
	    const ctoggle = contextToggles[cidx];
	    if (ctoggle) {
		setBorderStyle("none");
	    }
	    else {
            	const borderColor = getObj("C" + id);
            	setBorderStyle("5px solid " + borderColor);
	    }
	    setContextToggles(prev => {
		const next = [...prev];
		next[cidx] = !ctoggle;
		return next;
	    });
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
      fontSize: '14px', // small text
      fontWeight: 'bold', // bold text
      backgroundColor: '#f4e1a1', // manila color (a soft yellow)
      padding: '0', // no padding
      margin: '0', // no margins
      top: (y+labelOffsets[1])+"%",
      left: (x+labelOffsets[0])+"%",
      whiteSpace:"nowrap",
      width:`${name.length * 9}px`, //adjust length based on length of text
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
	    {(hover===hoverKey || bhover) ? (
		<input type="text" placeholder={name} style={labelStyle}/>
	    ):null}
        </div>
    );
}

export default Button;
