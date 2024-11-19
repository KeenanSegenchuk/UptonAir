import React, { useEffect, useState } from 'react';
import axios from 'axios';
function Button({ id, val, x, y, color, updateSensor }) {
    const handleButtonClick = (sensorValue, event) => {
        event.preventDefault(); // Prevent default behavior
        updateSensor(sensorValue); // Update sensor info
    };
    return (
	<div>
        <button
	    type ="button"
            style={{
                position: 'absolute',
                width: '15px',
                height: '15px',
		borderRadius: '50%',
                top: Math.round(y * 1020 /100),
                left: Math.round(x * 723 /100),
                backgroundColor: color,
		text-align: center,
		align-items: center,
		border: none,
            }}
	    onClick={(event) => updateSensor(id, event)}
        >
	    {val}
            {/* Button content can be added here */}
        </button>
	</div>
    );
}

export default Button;