import React, {} from 'react';
import "../App.css";

//This is the "use guide" from the landing page, it is meant to give a walkthough on how to use the dashboard
function UserGuide() {

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
	<div id="UserGuide.js" style={{border:"2px solid white"}}>
            <h2 id="guide" className="tabbed s25">How to use Upton-Air.com</h2>

	    <div style={{borderTop:"2px dashed white"}}/>
	    <h3 className="tabbed s18">How to check local air quality:</h3>
	    <p class = "centered s12">
		Up-to-date small particulate pollution data can be found on&nbsp; 
		<a href="https://Upton-Air.com/dashboard" target="_blank">Upton-Air.com/dashboard</a>.
	    </p>

	    <div style={{height:"20px"}}/>

	    <p class="centered s12">
		The air monitors throughout town are shown as dots on a map, and the color an number on the dot corresponds to the average AQI reported by that monitor over the past hour.
	    </p>	
	    <img alt="" src="figs/UG_dashboard.png" class="figure"/>
	    <p class="centered s12">		
		You can see longer averages and a graph to the right of the map.
		<br/>
		Clicking a dot on the map will bring up that air monitor's data, but it shows the average of all monitors in Upton by default. 
	    </p>
	    <img alt="" src="figs/UG_changesensor.png" class="figure"/>
	    <p class="centered s12">		
		The large button on the top left of the map represents the average of all sensors in Upton and can be clicked to revert the graph to the town average.		
		<br/>
		You can also change the map and data type by using the gear icon located on the map.
	    </p>
	    <img alt="" src="figs/UG_map.png" class="figure"/>
	    <p class="centered s12">
		For µg/m³ PM2.5 data we don't have colors to correspond with different ranges like with AQI so it's all aqua. 
	    </p>
            <div style={{height:"25px"}}/>


	    <div style={{borderTop:"2px dashed white"}}/>
            <h3 className="tabbed s18">How to compare AQI at different locations:</h3>
	    <p class="centered s12">
		There are also buttons to control the timeframe of the graphed data and the graph type.
	    </p>
	    <img alt="" src="figs/UG_linegraph.png" class="figure"/>
	    <p class="centered s12">
		The line graph allows you to select multiple air monitors on the map and compare their readings. 
		<br/>
		The readings from Memorial seem off compared to other sensors, so we can check the channel discrepancy to see if the sensor is acting up.
	    </p>
	    <img alt="" src="figs/UG_channeldiff.png" class="figure"/>
	    <p class="centered s12">
		The channel difference at Memorial is much higher than other sensors which means one of the individual sensors within the air monitor is not functioning properly. 
		<br/>
		Channel difference is calculated as the difference between both channels' readings over their average, so values over 100% mean one of the channels is off by more than their average. 
	    </p>
            <div style={{height:"25px"}}/>


	    <div style={{borderTop:"2px dashed white"}}/>
            <h3 className="tabbed s18">How to set up an air quality notification:</h3>
	    <p class = "centered s12">
		You can set up an air quality notification on&nbsp; 
		<a href="https://Upton-Air.com/alerts" target="_blank">Upton-Air.com/alerts</a>.
	    </p>
	  {isMobile ? <p class='centered s12'><br/>This is still work in progress (WIP). Check the alert description at the bottom of the form to ensure it's configured correctly before submitting.</p> : 
	    <div style={{display:"flex", flexDirection: "row"}}>
		<img alt="" src="figs/UG_alert.png" width="auto" height="auto" style={{maxWidth:"50%", padding:"15px", paddingRight:"3px"}}/>
		<div style={{display:"inline"}}>
			<div style={{height:"23%"}}/>
			<p class="s8 mh105 verticalCenter">
				To start setting up your alert, you must provide an email and alert name.
				If you have multiple alerts associated with the same email they must have unique names so the database can tell them apart.
			</p>
			<div style={{height:"4%"}}/>
			<p class="s8 mh105 verticalCenter">
				Select what air monitors you want to trigger the notification. 
				<br/>
				Here I select the monitors near West Upton so I can be notified about the air quality in that area.
			</p>
			<div style={{height:"4%"}}/>
			<p class="s8 mh105 verticalCenter">
				You can also chose an AQI threshold to trigger the alert. 
				<br/>
				Alert Cooldown sets the minimum time between alerts in hours so your email wont be spammed.
			</p>
			<div style={{height:"1%"}}/>
			<p class="s8 mh66 verticalCenter">
				Averaging Window controls what timespan's AQI average is being compared against the AQI threshold. 
			</p>
			<div style={{height:"10%"}}/>
			<p class="s8 mh66 verticalCenter">
				Before submiting you should check the alert description to make sure the alert is configured how you want it. 
			</p>
		</div>
	    </div>
	  }
	    <div style={{height:"25px"}}/>
	</div>
    );
};

export default UserGuide;