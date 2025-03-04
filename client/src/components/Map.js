import React from 'react';
import Button from "./Button";
import "../App.css";
import HoverButton from "./HoverButton";

function Map({ buttons, updateSensor }) {
    return (
        <div className="map-container">
            <div className="sensorOverlay">
                {buttons.map((button, index) => (
                    <Button key={index} val={button.avg} id={button.id} x={button.x} y={button.y} updateSensor={updateSensor} />
                ))}
		<img className="mapImg" src="/figs/upton.png" alt="Map"/>
		<HoverButton className="Button" text={"Hover here to show location names."} hoverKey="labels" style={{height:"30px"}}/>
            </div>
        </div>
    );
}

export default Map;