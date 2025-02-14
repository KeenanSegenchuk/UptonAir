import React from 'react';
import Button from "./Button";
import "../App.css";

function Map({ buttons, updateSensor }) {
    return (
        <div className="map-container">
            <div className="sensorOverlay">
                {buttons.map((button, index) => (
                    <Button key={index} val={button.avg} id={button.id} x={button.x} y={button.y} updateSensor={updateSensor} />
                ))}
		<img className="mapImg" src="/figs/upton.png" alt="Map"/>
            </div>
        </div>
    );
}

export default Map;