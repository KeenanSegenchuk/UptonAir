import React, {} from 'react';
import "../App.css";

//This is the "use guide" from the landing page, it is meant to give a walkthough on how to use the dashboard
function UserGuide() {

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
        <div id="UserGuide.js" style={{border:"4px solid white", width: "90%", margin: "0 auto"}}>
            <div style={{ borderBottom: "4px solid white"}}><h2 id="guide" className="tabbed s25">How to use Upton-Air.com</h2></div>
    
            <div style={{height:"85vh", overflowY:"scroll"}}>
        	    <div style={{borderTop:"2px dashed white"}}/>
        	    <h3 id="ug1" className="tabbed s18">How to check local air quality:</h3>
        	    <p class = "centered s12">
        		Up-to-date small particulate pollution data can be found on&nbsp; 
        		<a href="https://Upton-Air.com/dashboard" target="_blank" rel="noreferrer">Upton-Air.com/dashboard</a>.
        	    </p>
        	    <div style={{height:"20px"}}/>
        	    <p class="centered s12">
        		The air monitors throughout town are shown as dots on a map. The color and number on the dot corresponds to the average AQI reported by that monitor over the past hour.
        	    </p>	
        	    <img alt="" src="figs/UG1.jpg" class="figure"/>
        	    <p class="centered s12">		
        		(1) Click a dot on the map to display air quality data from that location. Selected dots are highlighted with a color to help you keep track of which is which on a line graph.
			<br/>
			(2) The large button on the top left of the map represents the average of all sensors in Upton and can be clicked to revert the graph to the town average.		
        		<br/>
        		(3) Historical averages for the selected sensor are displayed here. You can also click the timeframe labels to load the historical data from that timeframe on the graph.
        		<br/>
			(3.1) The banner (and map buttons) show the sensor's average over the last hour. The banner will also give a brief description of the current pollution level and its health effects.
			<br/>
			(4) The bar below the graph is used to zoom the graph to a specific time range.
			<br/>
			(5) The gear icon on the graph opens the dashboard config.
		    </p>
                    <div style={{height:"25px"}}/>
        
        
        	    <div style={{borderTop:"2px dashed white"}}/>
                    <h3 id="ug2" className="tabbed s18">How to compare AQI at different locations:</h3>
        	    <div style={{height:"20px"}}/>
        	    <p class="centered s12">
        		Click the gear icon on the map to open the dashboard config. Below you can see what each setting does.
        	    </p>	
        	    <img alt="" src="figs/ug2.jpg" class="figure"/>
        	    <p class="centered s12">
        		(1) This changes the unit/measurement displayed on the map, graph, and historical summaries.
			<br/>
			(2) Use this to set the graph type to line mode (which allows graphing multiple data series) or bar graph (which color-codes AQI levels, but cannot show multiple data series).
			<br/>
			(3) This setting only appears when the graph is in line mode, decides whether the line graph is used to display multiple sensors or multiple units/measurements.
			<br/>
			(4) Select what sensors to show on the graph, or you can click the dots on the map to select/unselect sensors.
			<br/>
			(5) Here you can see the community center deviates significantly form the town average. Below we will zoom in on this timeframe and analyze what might be causing this.
        	    </p>
                    <div style={{height:"25px"}}/>


        	    <div style={{borderTop:"2px dashed white"}}/>
                    <h3 id="ug3" className="tabbed s18">How to compare different readings at the same location:</h3>
        	    <div style={{height:"20px"}}/>
        	    <p class="centered s12">
        		Here we will use the "units" mode for the line graph to check this sensor's accuracy.
        	    </p>
        	    <img alt="" src="figs/ug3.jpg" class="figure"/>
        	    <p class="centered s12">
        		(1) Set the line graph mode to units. But be careful! This will overwrite the "Main Map/Graph Units" for the graph, but not on the map or historical averages above the graph.
			<br/>
			(2) Select the units you want to compare. Here I compare at the sensor channels (each monitor has 2 individual sensors which are averaged to get data from that location).
			<br/>
			(3) Here we zoom in on the relevant timeframe to make the data easier to see.
			<br/>
			(4) And now the graph reveals a discrepancy between the two sensor channels, showing that this sensor is acting up and may be producing innacurate data. If large channel discrepancies like this persist over a long period of time then the sensor should be replaced.
			<br/><br/>
			By setting line graph mode to "sensors" I used "Main Map/Graph Units" to compare each channel against the town average and have confirmed that channel B deviates much more than channel A, meaning that channel A likely produces a more accurate result at the community sensor.
        	    </p>
                    <div style={{height:"25px"}}/>
        
        
        	    <div style={{borderTop:"2px dashed white"}}/>
                    <h3 id="alerts" className="tabbed s18">How to set up an air quality notification:</h3>
        	    <p class = "centered s15">
        		You can set up an air quality notification on&nbsp; 
        		<a href="https://Upton-Air.com/alerts" target="_blank" rel="noreferrer">Upton-Air.com/alerts</a>.
        	    </p>
        	  {isMobile ? <p class='centered s15'><br/>Check the alert description at the bottom of the form to ensure it's configured correctly before submitting.</p> : 
        	    <div style={{display:"flex", flexDirection: "row"}}>
        		<img alt="" src="figs/UG_alerts.png" width="auto" height="auto" style={{maxWidth:"40%", padding:"15px", paddingRight:"3px"}}/>
        		<div style={{display:"inline"}}>
        			<div style={{height:"22%"}}/>
        			<p class="s12 height105 verticalCenter">
        				1. To start setting up your alert, you must provide an email and alert name.
					<br/>
        				2. If you have multiple alerts associated with the same email they must have unique names so the database can tell them apart.
        			</p>
        			<div style={{height:"3.5%"}}/>
        			<p class="s12 height105 verticalCenter">
        				3. Select what air monitors you want the alert to monitor.
        			</p>
        			<div style={{height:"6%"}}/>
        			<p class="s12 height205 verticalCenter">
        				4. Choose whether the alert should be triggered by any selected sensor exceeding the threshold, or by the average of the selected sensors exceeding it.
        				<br/>
        				5. Choose the air quality measurement/units you want the alert to monitor.
        				<br/>
        				6. You can also chose an AQI threshold to trigger the alert.
        				<br/>
        				7. Averaging Window controls what timespan's AQI average is being compared against the AQI threshold. 
					<br/>
					8. Alert Cooldown sets the minimum time between alerts in hours so your email wont be spammed.
        			</p>
        			<div style={{height:"15%"}}/>
        			<p class="s12 height66 verticalCenter">
        				9. Before submiting you should check the alert description to make sure the alert is configured how you want it. 
        			</p>
        		</div>
        	    </div>
        	  }
        	    <p class = "centered s12">
        		Once you've set up your alert you will be emailed whenever the average AQIEPA across all selected sensors exceeds the threshold you set.
        		You will not be emailed if this alert has already been triggered within the cooldown period you configured.
        	    </p>
        	    <div style={{height:"25px"}}/>
    	    </div>
    	</div>
    );
};

export default UserGuide;