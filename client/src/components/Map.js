import React from 'react';
import Button from "./Button";

function Map({ buttons, updateSensor }) {
    return (
        <div className="map-container" style={{ position: 'relative' }}>
            <img src="/figs/upton.png" alt="Map" />
            <div className="sensor-overlay" style={{ position: 'absolute', top: 0, left: 0, width : "100%", height: "100%" }}>
                {buttons.map((button, index) => (
                    <Button key={index} val={button.avg} id={button.id} x={button.x} y={button.y} updateSensor={updateSensor} />
                ))}
            </div>
        </div>
    );
}

export default Map;