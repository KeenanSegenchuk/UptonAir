import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import "../App.css";
import Map from "../components/Map";
import SensorInfo from "../components/SensorInfo";
import LinkButton from "../components/LinkButton";
import InfoContainer from "../components/InfoContainer";
import { useAppContext } from "../AppContext";
const { getObj } = require("../getObj");
const sensors = getObj("positions");

//comment


function Home() { 
    const {API_URL} = useAppContext();
    const {BASE_URL} = useAppContext();
    const alerts_url = BASE_URL + "alerts";
    const api = axios.create({
      baseURL: API_URL,
    });

    //other vars
    const [loading, setLoading] = useState(false);
    const [infoSensor, setInfoSensor] = useState(0);
    const [dummy, setDummy] = useState(false);

    //times
    const date = Date.now();
    const sec = 1000;
    const hour = sec * 60 * 60;

    //logic for mobile popup
    const {showPopup, setPopup} = useAppContext();


    if (loading) {
        return <h1>Loading... </h1>;
    }

    return (
	<div className="blue" style = {{ height: '100vh', overflow: 'scroll' }}>

	    {/*Header*/}
	    <div className="title" style={{display:"flex", aligItems:"center", flexDirection:"horizontal"}}>
                <h1 className="titleText">Upton Air</h1>
	        <LinkButton style={{marginLeft:"auto", marginRight: "0"}} text="Get Notified" href={alerts_url}/>
	    </div>

	    {/*Page Body*/}
            <div className="floatContainer" >
                {/* Map */}
		<Map className="floatBox" buttons={sensors}/>
                <div className={`sensorInfo sinkBox ${showPopup ? "mobileOverlay open" : "hideMobile"}`}>
		    {/* Summary and Graph */}
       		    <SensorInfo id="infoBox" sensor_id={infoSensor}/>
		    <button className="closePopup" onClick={() => setPopup(false)}>
			✕ Close
		    </button>
      		</div> 
            </div>
	    
	
	    {/*Information*/}
	    <div className="infodiv">
		<InfoContainer infodoc="/infodocs/AQIranges.txt"/>
		<div style={{height: "25px"}}/>
		<InfoContainer infodoc="/infodocs/Particulate Pollution Patterns.txt"/>
	    </div>
	</div>
    );
}

export default Home;

