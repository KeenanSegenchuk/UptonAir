import React from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import Button from "./Button";

function Map({ buttons, infoRef }) {
    return (
        <div className="map-container" style={{ position: 'relative' }}>
            <img src="/figs/upton.jpg" alt="Map" />
            <div className="sensor-overlay" style={{ position: 'absolute', top: 0, left: 0 }}>
                {buttons.map((button, index) => (
                    <Button key={index} id={button.id} x={button.x} y={button.y} color={button.color} infoRef={infoRef} />
                ))}
            </div>
        </div>
    );
}

export default Map;