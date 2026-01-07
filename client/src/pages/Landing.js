import React, {} from 'react';
import { useAppContext } from "../AppContext";
import "../App.css";
import LinkButton from "../components/LinkButton";
import InfoContainer from "../components/InfoContainer";
import UserGuide from "../components/UserGuide";
import config from "../config.json";

//This is the landing page for Upton-Air, it explains the project and how to use the other pages
function Landing() {
    const {BASE_URL} = useAppContext();
    const alerts_url = BASE_URL + "alerts";
    const dashboard_url = BASE_URL + "dashboard";

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
        <div className="darkgreen" style = {{ paddingBottom:"80vh", color: "white", padding: "12px" }}>
	    {/*Header*/}
	    <div className="title" style={{display:"flex", height:"70px", width:"100%", padding:"0px"}}>
	        <LinkButton className="leftLinkButton" text={isMobile?"Alerts":"To Alerts"} right={false} href={alerts_url}/>
                <h1 className="titleText">{isMobile?"Upton Air": config.WEBPAGE_TITLE + " Landing Page"}</h1>
	        <LinkButton className="rightLinkButton" text={isMobile?"Dashboard":"To Dashboard"} right={true} href={dashboard_url}/>
            </div>

	    <div style = {{height:"25px"}}/>


	    {/* Brief overview of site's purpose */}
	    <div style = {{textAlign:"center", border:"2px solid white", padding:"15px", width:"80%", marginLeft:"auto", marginRight:"auto", fontSize:"1.1em"}}>
	        <p class="wmargin s12">Upton-Air.com was built by Sustainable Upton with the help of the town and the Mass Department of Environmental Protection in order to inform people on the local air quality.</p>
	        <p class="wmargin s12">You can check current and historic air quality data on our dashboard page. For now our sensors only monitor small air particulates (PM2.5) and percent humidity. By default we measure air quality with the air quality index (AQI), an index developed by the U.S. EPA to break down pollutant levels into ranges which reflect their health effects.</p>
            
	        {/* Maybe add a link to the dashboard page here */}
	        <a href={dashboard_url} className="dashboardButton">Go to Dashboard</a>
	    
		<p class="wmargin s12">This page contains an overview of how to use the website, the broader context of air quality monitoring, and how to get involved.</p>

	    </div>


	    <div style={{height:"50px"}}/>

	    <h2 className="noLineSpacing" style={{fontSize:"2.5em"}}>Table of Contents</h2>
            {/* Table of Contents */}
            <div style = {{marginTop: "10px", marginBottom:"10px"}}>
		<a class="tabbed" href="#aqm" style={{fontSize:"2em"}}>Specifics about Air Quality Monitoring</a>
		<a href="#aqi" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Air Quality Index (AQI)</a>
		<a href="#ap" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Types of Air Pollution </a>
		<a href="#ana" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Analyzing the Data </a>
		<a href="#measure" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Measurements We Use </a>
		<p></p>
                <a class="tabbed" href="#guide" style={{fontSize:"2em"}}>User Guide</a>
		<a href="#ug1" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Check local air quality </a>
                <a href="#ug2" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Compare AQI at different locations </a>
                <a href="#ug3" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Compare different readings at the same location </a>
		<a href="#alerts" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Configure an air quality alert </a>
		<p></p>
		<a class="tabbed" href="#contact" style={{fontSize:"2em"}}>Contact Us</a>
		<a href="#feedback" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Share Feedback </a>
		<a href="#getinvolved" className="tabbed5 noLineSpacing" style={{color: "inherit", display: "block", fontSize:"1.5em"}}> - Get Involved </a>
            </div>


	    <div style={{height:"50px"}}/>

            {/* Contents */}

	    {/* background info on air quality monitoring */}
            <div style={{border:"4px solid white", width: "90%", margin: "0 auto"}}>
                <div style={{ borderBottom: "4px solid white"}}><h2 id="aqm" className="tabbed s25">Air Quality Monitoring</h2></div>
        
                <div style={{height: "85vh", overflowY:"scroll"}}>
            		<div style={{borderTop:"0px dashed white"}}/>
            	    	<h3 id="aqi" className="tabbed s18">Air Quality Index</h3>
            	    	<div className="infodiv"><InfoContainer infodoc="/infodocs/AQIranges.txt"/></div>    
                        	<div style={{height:"25px"}}/>
            
            
            		<div style={{borderTop:"2px dashed white"}}/>
            	    	<h3 id="ap" className="tabbed s18">Types of Air Pollution</h3>
            	    	<p class="s12 centered">The EPA currently uses the AQI scale to show health effects for different concentrations of 6 key air pollutants. These six include two types of solid particulate
            		air pollution (PM2.5 and PM10) and 4 gaseous chemicals (ground-level ozone, 
            		carbon monoxide, sulfur dioxide, and nitrogen dioxide). Our PurpleAir monitors were awarded
            		to us through a DEP grant and only collect PM2.5. While PM2.5 readings do tend to reflect
            		general air pollutant trends, it alone cannot give the full picture, so we hope to be able 
            		to provide data on other air pollutants in the future.
            		<br/><br/>
            		Lead is also considered a major air pollutant by the EPA, though the major source of airborne lead, leaded gasoline, has been mostly phased out of use.
            	    	</p>
            	    	<div style={{height:"25px"}}/>
             
            
            		<div style={{borderTop:"2px dashed white"}}/>
            	    	<h3 id="ana" className="tabbed s18">Analyzing the Data</h3>
            	    	<div className="infodiv"><InfoContainer infodoc="infodocs/Particulate Pollution Patterns.txt"/></div>
            	    	<div style={{height:"25px"}}/>
            
            
            		<div style={{borderTop:"2px dashed white"}}/>
            	    	<h3 id="measure" className="tabbed s18">Measurements We Use</h3>
            		<p class="centered s12">
            			The Upton-Air dashboard reports a variety of different measurement to help you analyze local air quality readings. Below are descriptions of the measurements we report:
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>PM:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			PM displays PM2.5, or the concentration of air particles less than 2.5 microns in diameter. This is reported as micrograms per cubic meter of air (ug/m^3). Micrograms are 1 millionth of a gram, so the concentrations being measured are very small.
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>PMEPA:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			PMEPA shows PM2.5 readings in ug/m^3 that are calibrated to better match with more expensive EPA sensors that are less sensitive to humidity changes.
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>AQI:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			AQI measures the same thing as PM2.5, but is scaled to make it easier to understand the possible effects on your health.
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>AQIEPA:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			AQIEPA is the default measurement displayed on the dashboard. It is on the same scale as normal AQI, but is calculated from PM2.5 levels that were adjusted for humidity to better match up with more expensive EPA sensors that are less sensitive to humidity changes.
            		</p> 
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>PMA/PMB:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			PMA and PMB are the readings from the two channels in a given sensor. This allows us to see when the channels diverge, indicating that air monitor readings may have deviated from the actual pollutant level at that location.
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>Humidity:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			This is just relative humidity as you'd see in any weather report. PurpleAir sensors are sensitive to changes in humidity, so we use humidity readings in an equation to calibrate PurpleAir readings with readings from more expensive and rigorously tested EPA sensors.
            		</p>
            		<div style={{height:"15px"}}/>
            		<p class="s12" style={{marginLeft:"15px"}}>Percent Difference:</p>
            		<p class="s8" style={{marginLeft:"30px"}}>
            			This is the difference between PMA and PMB as a percent of their average. It allows us to measure how well the channels of a given air monitor are lining up which can provide insights on whether spikes in the data are real pollution readings or anomalies like the sensor malfunctioning or bugs getting into it.
            		</p>
                	<div style={{height:"25px"}}/>
                </div>
            </div>

	
	    {/*User Guide*/}
	    <div style={{height:"35px"}}/>
            <UserGuide/>
	    <div style={{height:"35px"}}/>

		
	    <div style={{border:"2px solid white"}}>
                <h2 id="contact" className="tabbed s25">Contact Us</h2>
		<div style={{borderTop:"2px dashed white"}}/>
                <h3 id="feedback" class="tabbed s18">Share Feedback</h3>
		<p class="s12 centered">We would very much appreciate any feedback or suggestions on the website. 
		For now you can submit all feedback to&nbsp;
		<a href="https://docs.google.com/forms/d/e/1FAIpQLSe21Vobf8oFnvnsSUp6Ru0wW0g5Xoceb27VNS_abwRut-pOoA/viewform">our google form.</a>
		</p>
		<div style={{height:"25px"}}/>
		<div style={{borderTop:"2px dashed white"}}/>
                <h3 id="getinvolved" class="tabbed s18">Get Involved</h3>
		<p class="s12 centered">If you would like to host an air monitor, get involved in our work, or just reach out to someone at Sustainable Upton, 
		you can reach us via email:&nbsp;
		<a href="mailto:sustainableuptonma@gmail.com">sustainableuptonma@gmail.com</a>
		<br/><br/>
		You can also find us on the <a href="https://www.facebook.com/groups/1669539636635991/">Sustainable Upton Facebook page</a>
		</p>
		<div style={{height:"25px"}}/>
	    </div>
	    <div style={{height:"35px"}}/>
        </div>
    );
}

export default Landing;
