import React, { useState } from 'react';
import axios from 'axios';
import "../App.css";
import Map from "../components/Map";
import SensorInfo from "../components/SensorInfo";
import LinkButton from "../components/LinkButton";
import { useAppContext } from "../AppContext";
import config from "../config.json";

const { getObj } = require("../getObj");
const sensors = getObj("positions");

//this is the Dashboard now :/
function Home() { 
    //setup urls
    const {API_URL, BASE_URL} = useAppContext();
    const alerts_url = BASE_URL + "alerts";
    const api = axios.create({
      baseURL: API_URL,
    });

    //other vars
    const [loading, setLoading] = useState(false);
    const {sensor_id, setHover} = useAppContext();
    const [dummy, setDummy] = useState(false);

    //times
    const date = Date.now();
    const sec = 1000;
    const hour = sec * 60 * 60;

    //logic for mobile popup
    const {showPopup, setPopup, setGlobalLineBool} = useAppContext();


    if (loading) {
        return <h1>Loading... </h1>;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
	<div className="darkgreen" style = {{ height: '100vh', overflow: 'scroll', display: 'flex', flexDirection: 'column' }}>

	    {/*Header*/}
	    <div className="title" style={{display:"flex", alignItems:"center", flexDirection:"row", height:"50px"}}>
		<LinkButton className="leftLinkButton" text={isMobile?"Info":"More Info"} right={false} href={BASE_URL}/>
		<h1 className="titleText">{isMobile ? "Dashboard" : config.WEBPAGE_TITLE + " Dashboard"}</h1>
	        <LinkButton className="rightLinkButton" text={isMobile?"Alerts":"Get Notified"} href={alerts_url}/>
	    </div>

	    {/*Page Body*/}
            <div className="container" style={{flex:1}}>
                {/* Map */}
		<Map className="floatBox" buttons={sensors}/>
                <div className={`sensorInfo contentBackground sinkBox ${showPopup ? "mobileOverlay open" : "hideMobile"}`}>
		    {/* Summary and Graph */}
		    <button className="closePopup" onClick={() => { setPopup(false); setHover("closed"); /*setGlobalLineBool(false);*/ }}>
			  <span className="label">Return to Map</span>
			  <span className="closeIcon">✖</span>
		    </button>
       		    <SensorInfo id="infoBox" sensor_id={sensor_id}/>
      		</div> 
            </div>
	</div>
    );
}

export default Home;

