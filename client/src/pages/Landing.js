import React, {} from 'react';
import { useAppContext } from "../AppContext";
import "../App.css";
import LinkButton from "../components/LinkButton";
import InfoContainer from "../components/InfoContainer";
import UserGuide from "../components/UserGuide";

//This is the landing page for Upton-Air, it explains the project and how to use the other pages
function Landing() {
    const {BASE_URL} = useAppContext();
    const alerts_url = BASE_URL + "alerts";
    const dashboard_url = BASE_URL + "dashboard";
    return (
        <div className="darkgreen" style = {{ paddingBottom:"80vh", color: "white", padding: "12px" }}>
	    {/*Header*/}
	    <div className="title" style={{display:"flex", height:"70px", width:"100%", padding:"0px"}}>
	        <LinkButton className="leftLinkButton" text={window.matchMedia("(max-width: 767px)").matches?"":"To Alerts"} right={false} href={alerts_url}/>
                <h1 className="titleText">Upton Air Landing Page</h1>
	        <LinkButton className="rightLinkButton" text={window.matchMedia("(max-width: 767px)").matches?"":"To Dashboard"} right={true} href={dashboard_url}/>
            </div>

	    <div style = {{height:"25px"}}/>


	    {/* Brief overview of site's purpose */}
	    <div style = {{textAlign:"center", border:"2px solid white", padding:"15px", width:"80%", marginLeft:"auto", marginRight:"auto", fontSize:"1.1em"}}>
	        <p class="wmargin s12">Upton-Air.com was built by Sustainable Upton with the help of the town and the DEP in order to inform people on the local air quality.</p>
	        <p class="wmargin s12">You can check current and historic air quality data on our dashboard page. For now our sensors only monitor small air particulates (PM2.5), and all data shown on the dashboard has been converted to AQI.</p>
            
	        {/* Maybe add a link to the dashboard page here */}
	        <a href={dashboard_url} className="dashboardButton">Go to Dashboard</a>
	    
		<p class="wmargin s12">This page contains an overview of how to use the website, the broader context of air quality monitoring, and how to get involved.</p>

	    </div>


	    <div style={{height:"50px"}}/>

	    <h2 className="noLineSpacing" style={{fontSize:"2.5em"}}>Table of Contents</h2>
            {/* Table of Contents */}
            <div style = {{marginTop: "10px", marginBottom:"10px"}}>
                <a class="tabbed" href="#guide" style={{fontSize:"2em"}}>User Guide</a>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Check local air quality </p>
                <p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Compare AQI at different locations </p>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Configure an air quality alert </p>
		<p></p>
		<a class="tabbed" href="#aqm" style={{fontSize:"2em"}}>Specifics about Air Quality Monitoring</a>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Types of Air Pollution </p>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Air Quality Index (AQI)</p>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Analyzing the Data </p>
		<p></p>
		<a class="tabbed" href="#contact" style={{fontSize:"2em"}}>Contact Us</a>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Share Feedback </p>
		<p className="tabbed noLineSpacing" style={{fontSize:"1.5em"}}> - Get Involved </p>
            </div>


	    <div style={{height:"50px"}}/>

            {/* Contents */}
            <UserGuide/>
	    <div style={{height:"35px"}}/>

	    <div style={{border:"2px solid white"}}>
            	<h2 id="aqm" className="tabbed s25">Air Quality Monitoring</h2>

		<div style={{borderTop:"2px dashed white"}}/>
	    	<h3 className="tabbed s18">Air Quality Index</h3>
	    	<div className="infodiv"><InfoContainer infodoc="/infodocs/AQIranges.txt"/></div>    
            	<div style={{height:"25px"}}/>

		<div style={{borderTop:"2px dashed white"}}/>
	    	<h3 className="tabbed s18">Types of Air Pollution</h3>
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
	    	<h3 className="tabbed s18">Analyzing the Data</h3>
	    	<div className="infodiv"><InfoContainer infodoc="infodocs/Particulate Pollution Patterns.txt"/></div>
	    	<div style={{height:"25px"}}/>
	    </div>
	    <div style={{height:"35px"}}/>

		
	    <div style={{border:"2px solid white"}}>
                <h2 id="contact" className="tabbed s25">Contact Us</h2>
		<div style={{borderTop:"2px dashed white"}}/>
                <h3 class="tabbed s18">Share Feedback</h3>
		<p class="s12 centered">We would very much appreciate any feedback or suggestions on the website. 
		For now you can submit all feedback to uptonAQalerts@gmail.com.
		</p>
		<div style={{height:"25px"}}/>
		<div style={{borderTop:"2px dashed white"}}/>
                <h3 class="tabbed s18">Get Involved</h3>
		<p class="s12 centered">If you would like to host an air monitor, get involved in our work, or just reach out to someone at Sustainable Upton, 
		you can reach us via email: (insert sustainable upton email address).</p>
		<div style={{height:"25px"}}/>
	    </div>
	    <div style={{height:"35px"}}/>
        </div>
    );
}

export default Landing;