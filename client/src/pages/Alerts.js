import React, { useState } from 'react';
import axios from 'axios';
import "../App.css";
import "../DeepseekCSSorcery/Alerts.css";
import LinkButton from "../components/LinkButton";
import { useAppContext } from "../AppContext";
const { getObj } = require("../getObj");
const sensors = getObj("positions");
const units = getObj("u");
const unitDesc = getObj("ud");


function Alerts() {
    const {BASE_URL} = useAppContext();
    const API_URL = BASE_URL + "api/";
    const dashboard_url = BASE_URL + "dashboard";
    const api = axios.create({
      baseURL: API_URL,
    });

    const [email, setEmail] = useState('');
    const [unit, setUnit] = useState("AQIEPA");
    const [AQIcutoff, setAQIcutoff] = useState(75);
    const [alertName, setAlertName] = useState('');
    const [alertSensors, setAlertSensors] = useState(
		Object.values(sensors)
                        .filter(sensor => sensor.id !== "0")
                        .map(sensor => sensor.id.toString())
    );
    const [cooldown, setCooldown] = useState(24);
    const [avgWindow, setAvgWindow] = useState('60');

    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('add');

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handleCutoffChange = (event) => setAQIcutoff(event.target.value);
    const handleNameChange = (e) => setAlertName(e.target.value);
    const handleSensorSelectChange = (e) => {
        const { value, checked } = e.target;

        setAlertSensors(prev => {
            if (value === "All") {
		return checked 
                    ? Object.values(sensors)
                        .filter(sensor => sensor.id !== "0")
                        .map(sensor => sensor.id.toString())
                    : [];
            }

            let next = [...prev];

            if (checked) {
                next.push(value);
            } else {
                next = next.filter(v => v !== value);
            }

            return next;
        });
    };
    const handleUnitChange = (e) => setUnit(e.target.value);
    const handleCooldownChange = (e) => setCooldown(e.target.value);
    const handleWindowChange = (e) => setAvgWindow(Math.round(10*e.target.value)/10);

    const showNotification = (message, isSuccess = true) => {
        setNotification({ message, isSuccess });
        setTimeout(() => setNotification(null), 21000);
    };
    //convert selection list to csv string
    const L2S = (selected) => {
        if (selected.includes("All")) return "All";
        return selected.join(",");
    };

    const addContact = () => {
	const ids = L2S(alertSensors);

        api.post(`alerts/add/${email}/${alertName}/${unit}/${AQIcutoff}/${ids}/${cooldown}/${avgWindow}`)
            .then(response => {
                showNotification(`Success! Alert "${alertName}" added for ${email}.`, true);
                console.log("Response from contact info add request:", response);
            }).catch(error => {
		const serverMessage = error.response?.data?.error || "Unknown error occurred.";
                showNotification(`Error adding alert: ${serverMessage}`, false);
            });
    };

    const removeContact = () => {

        api.post(`alerts/remove/${email}/${alertName}`)
	    .then(response => {
		    const serverMessage = response.data?.message || 'Successfully removed alert';
		    showNotification(`Success: ${serverMessage}`, true);
		    console.log("Server message:", serverMessage);
	    }).catch(error => {
		const serverMessage = error.response?.data?.error || "Unknown error occurred.";
                showNotification(`Error removing alert: ${serverMessage}`, false);
            });
    };

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
      <div style={{width:"100%"}}>
	{/*Header*/}
	<div className="title" style={{width:"100%", display:"flex", height:"70px"}}>
	    <LinkButton className="leftLinkButton" text={isMobile?"":"Back to Dashboard"} right={false} href={dashboard_url}/>
            <h1         style={{
			marginTop:"10px",
            		position: "absolute",
            		left: "50%",
            		transform: "translateX(-50%)"}}
            >{isMobile?"Alerts":"Upton Air Alerts"}</h1>
	    <LinkButton className="rightLinkButton" text={isMobile?"":"Back to Landing Page"} right={true} href={BASE_URL}/>
	</div>
	
        <div className="alerts-container">
	    <center className="title">
                <h1>Air Quality Alerts</h1>
                <p className="subtitle">Stay informed about your local air quality</p>
            </center>

            <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add Alert
                </button>
                <button 
                    className={`tab-button ${activeTab === 'remove' ? 'active' : ''}`}
                    onClick={() => setActiveTab('remove')}
                >
                    Remove Alert
                </button>
            </div>

            {activeTab === 'add' ? (
		<div>
                <div className="alert-description">
                    <p>Configure your air quality alert. You must provide a unique alert name if you already have an alert setup with the given email.</p>
                </div>
                <div className="input-group" style = {{display:"flex", flexDirection:"column"}}>
                    
		    {/*
		    <input 
                        type="email" 
                        value={email} 
                        onChange={handleEmailChange} 
                        placeholder="your.email@example.com" 
                        className="input-field"
                    />
		    <input
                        type="text" 
                        value={alertName} 
                        onChange={handleNameChange} 
                        placeholder="Unique Alert Name" 
                        className="input-field"
                    />
		    */}
		    
		    <div style = {{display:"flex", flexDirection:"row", alignItems:"center"}}><label>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>

		    <input 
                        type="email" 
                        value={email} 
                        onChange={handleEmailChange} 
                        placeholder="your.email@example.com" 
                        className="input-field"
			style={{width:"100%"}}
                    /></div>
                    <div style = {{display:"flex", flexDirection:"row", alignItems:"center"}}><label>Alert Name:{"\u200A"}&nbsp;&nbsp;&nbsp;</label>
		    <input
                        type="text" 
                        value={alertName} 
                        onChange={handleNameChange} 
                        placeholder="Unique Alert Name" 
                        className="input-field"
                    /></div>
		</div>
		<center> Select sensors to monitor. </center>
                <div style={{   margin: "10px",
				display: 'flex', 
				flexDirection: 'column',
				flexWrap: "wrap",
				maxHeight: "130px" }}>
                    <label>
                        <input
                            type="checkbox"
                            value="All"
                            checked={alertSensors.length === sensors.length - 1 /*dont count the town average sensor*/} 
                            onChange={handleSensorSelectChange}
                        />
                        All
                    </label>
                    {Object.values(sensors).filter(sensor => sensor.id !== "0").map(sensor => (
                        <label key={sensor.id}>
                            <input
                                type="checkbox"
                                value={sensor.id.toString()}
                                checked={alertSensors.includes(sensor.id.toString())}
                                onChange={handleSensorSelectChange}
                            />
                            {sensor.name || `Sensor ${sensor.id}`}
                        </label>
                    ))}
                </div>
		<div style={{   justifyContent:"center",
				width:"100%",
				display: "flex",
				gap: "10px",
				flexDirection: "row"}}>
		    		<div style={{ flex: 1, margin: "10px" }}>
		        <center>Unit/Measure:</center>
		        <select
		            value={unit}
		            onChange={handleUnitChange}
		            className="input-field"
		            style={{ width: "100%", boxSizing: "border-box" }}
		        >
		            <option value="">-- Select a unit --</option>
		            {Object.keys(units).map((u, i) => (
		                <option key={i} value={u}>
		                    {unitDesc[u]}
		                </option>
		            ))}
		        </select>
		    </div>
                    <div style={{ flex: 1, margin:"10px" }}><center>Threshold ({units[unit]}):</center>
		    <input
                        type="number"
                        value={AQIcutoff}
                        onChange={handleCutoffChange}
                        placeholder="threshold to trigger alert"
                        className="input-field"
			style={{width:"100%", boxSizing: "border-box"}}
                    /></div>
		</div>    
		<div style={{   display: "flex",
				flexDirection: "row"}}>
		    <div style={{   flex: 1,
				display: "flex",
				flexDirection: "column", 
				margin:"10px"}}>
		    	<center>Averaging Window (minutes):</center>
			<div style={{   display: "flex",flexDirection: "row"}}>
		    		<input
                        		type="number" 
                        		value={avgWindow} 
					step={10}
                        		onChange={handleWindowChange} 
                        		placeholder="Averaging window (in minutes)" 
                        		className="input-field"
					style={{width:"100%", boxSizing: "border-box"}}
                    		/>
			</div>
		    	<center style={{marginTop:"0px", fontSize:"12px"}}>*Our data consists of 10-minute averages, so averaging windows will be rounded to the nearest 10s place.</center>
		    </div>
		
		    <div style={{ flex: 1, margin:"10px"}}><center>Email Cooldown (hours):</center>
		    <input
                        type="number" 
                        value={cooldown} 
                        onChange={handleCooldownChange} 
                        placeholder="Cooldown between alerts (in hours)" 
                        className="input-field"
			style={{width:"100%", boxSizing: "border-box"}}
                    /></div>                

		</div>
		    <div style={{lineHeight:"1", paddingTop:"30px"}}>
			<p>This alert is named "<b>{alertName}</b>" and is associated with the email: "<b>{email}</b>".</p> 
			<br/><p>A notification will be triggered if <b>{unit}</b> readings from the selected sensors average over <b>{AQIcutoff}</b> for <b>{avgWindow}</b> minutes.</p>
			<br/><p>You will not receive another notification from this alert if one has been issued in the past <b>{cooldown}</b> hours.</p>
		    </div>
		</div>
	    ) : (
		<div>
                <div>
                    <p>Enter an alert name and associated email to unsubscribe from an alert.</p>
		    <p>!WIP!: You can also enter ALERT_SUMMARY in the name field to be emailed a summary of all alerts associated with that email.</p> 
                </div>
		<div className="input-group">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={handleEmailChange} 
                        placeholder="your.email@example.com" 
                        className="input-field"
                    />
		    <input
                        type="text" 
                        value={alertName} 
                        onChange={handleNameChange} 
                        placeholder="Unique Alert Name" 
                        className="input-field"
                    />
		</div>
		</div>
	    )}	
	    <div style={{height:"15px"}}/>
            {notification && (
                <div className={`notification ${notification.isSuccess ? 'success' : 'error'}`}>
                    {notification.message}
                </div>
            )}
	    <button     onClick={activeTab === 'add' ? addContact : activeTab === 'remove' ? removeContact : undefined}
			className={activeTab === 'add' ? 'add-button' : activeTab === 'remove' ? 'remove-button' : ''} 
			style={{width:"100%", height:"50px", marginTop:"15px", margin:"auto"}}
	    >
		  Submit
	    </button>
            <div className="disclaimer">
                <small>We respect your privacy. Your contact information will only be used for air quality alerts.</small>
            </div>
        </div>
      </div>
    );
}


export default Alerts;
