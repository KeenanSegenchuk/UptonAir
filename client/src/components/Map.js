import React from 'react';
import Button from "./Button";
import "../App.css";
import DButton from "./DButton";
import ToggleButton from "./ToggleButton";
import { useAppContext } from "../AppContext";

function Map({ buttons, updateSensor }) {
    const {setPopup} = useAppContext();


    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const triggerPopup = () => {
      if (isMobile) {
        setPopup(true);
      }
    };

    return (
        <div className="mapContainer">
            <div className="sensorOverlay">
                {buttons.map((button, index) => (
                    <Button onClick={() => triggerPopup()} key={index} val={button.avg} id={button.id} x={button.x} y={button.y} updateSensor={updateSensor} />
                ))}
		<img className="mapImg" src="/figs/upton.png" alt="Map"/>
		<div style={{display:"flex", justifyContent: "center", aligItems:"center", top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
		    {isMobile ? 
		        (<ToggleButton className="Button"  textOn={"Click to enable sensor summary."} textOff={"Click to enable sensor selection."} toggleKey="select" style={{height:"30px"}}/>)
			:
		        (<DButton className="Button" text={"Hover/Click here to show location names."} dkey="labels" style={{height:"30px"}}/>)
		    }
		</div>
            </div>
        </div>
    );
}

export default Map;