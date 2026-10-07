import React, {} from 'react';
import { useAppContext } from "../AppContext";
import "../App.css";
import "./Landing.css";
import SiteHeader from "../components/SiteHeader";
import InfoContainer from "../components/InfoContainer";
import UserGuide from "../components/UserGuide";

//This is the landing page for Upton-Air, it explains the project and how to use the other pages
function Landing() {
    const {BASE_URL} = useAppContext();
    const alerts_url = BASE_URL + "alerts";
    const dashboard_url = BASE_URL;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return (
        <div className="landingPage">
	    {/*Header*/}
	    <SiteHeader pageTitle="Landing Page" leftLabel="Alerts" leftLabelExpanded="Get Notified" leftLink={alerts_url} rightLabel="Dashboard" rightLink={dashboard_url} />

	    <div style = {{height:"25px"}}/>

	    {/* Brief overview of site's purpose */}
	    <div className="infoDiv">
			<h2 className="infoHeader">Welcome to Upton-Air</h2>
			<p className="infoParagraph">Upton-Air.com was built by Sustainable Upton with the help of the town and the Mass Department of Environmental Protection in order to inform the local community about Upton's ever-changing air quality.</p>
			<p className="infoParagraph">Visit our <a href="/dashboard">dashboard</a> to check current and historical air pollution levels across Upton, or use our <a href="/alerts">alerts page</a> to set up email notifications and get informed when air pollution levels exceed a threshold.</p>
			<p className="infoParagraph">Continue reading below to learn about the science of air quality monitoring, the health effects of air pollution, and what your options are to mitigate the impact of air pollution on your health.</p>
	    </div>

	    {/* The methodology behind our air quality monitoring */}
	    <div className="infoDiv">
			<h2 className="infoHeader">The science of air quality monitoring.</h2>
			<h3 className="miniInfoHeader">Types of air pollution:</h3>
			<p className="infoParagraph">Our PurpleAir air monitors measure one specific type air pollution, PM2.5, which consists of airborne particulates with diameters of 2.5 microns or smaller, roughly 1/30th the width of a human hair.
			</p><p className="infoParagraph">
				Besides PM2.5 pollution, the EPA also tracks PM10, ozone, carbon monoxide, sulfur dioxide, and nitrogen dioxide, but PM2.5 covers most major pollution sources like smoke and emissions, 
				and can detect byproducts of sulfur dioxide and nitrogen dioxide interacting with the atmosphere, making PM2.5 the ideal measure for general air quality.
			</p>
		
			<h3 className="miniInfoHeader">How PM2.5 concentrations are measured:</h3>
			<p className="infoParagraph">Our sensors measure small particulate concentrations by using a laser, counting whenever those particles scatter its light, and then calculating the weight of those particles based on their size and quantity. 
				This method of measuring air quality is cheap and allows for continuous monitoring, but readings are impacted by humidity, which also scatters light. To avoid this, federal regulatory monitors use filters which collect only PM2.5 particles, but they require replacing the filter every reading, making this method quite costly. 
				In order to leverage the price-effectiveness of the laser-based sensors while minimizing the impacts of humidity, PurpleAir monitors also include a humidity sensor, which can be used to adjust readings based on humidity to better fit the readings of regulatory monitors.
				On the dashboard, we report these EPA calibrated readings in addition to the unadjusted readings that are affected by humidity.
			</p><p className="infoParagraph">
				NOTE: This calibration method sometimes gives slightly negative readings, so you may see that on the dashboard when humidity is high and pollution levels are near zero.
			</p>

			<h3 className="miniInfoHeader">The Air Quality Index (AQI):</h3>
			<p className="infoParagraph">Our monitors report PM2.5 concentrations as micrograms of pollutant per cubic meter of air, but just knowing the concentration of pollutants doesn't tell you what effects it might have on your health.
				To make air quality readings tell you something useful about their impacts the EPA developed the Air Quality Index (AQI), which breaks air quality down into ranges based on the potential health effects. To familiarize yourself with the AQI scale, you can visit the <a href="https://www.airnow.gov/aqi/aqi-basics/">EPA's AQI page</a> or look at the AQI range descriptions below.
			</p>

			<InfoContainer infodoc="/infodocs/AQIranges.txt"/>
	    </div>

	    {/* Health Effects */}
	    <div className="infoDiv">
			<h2 className="infoHeader">Air Quality and Your Health</h2>
			<h3 className="miniInfoHeader">Health Impacts:</h3>
			<p className="infoParagraph"><a href="https://link.springer.com/article/10.1186/s12940-022-00879-3">This Boston college article</a> shows PM2.5 pollution 
			has had negative effects on individuals' neurological, respiratory, and cardiovascular health in Massachusetts. PM2.5 particles primarily impact health through oxidative stress and inflammation, 
			with ultrafine particles like smoke and emissions being especially impactful on your nervous system due to their ability to enter nervous tissue and cross the blood-brain barrier.
	    		</p>
	
			{/* Mitigating Impact */}
			<h3 className="miniInfoHeader">Mitigating Impact:</h3>
			<p className="infoParagraph">While Upton's small particulate pollution concentrations are okay most of the time, 
			there are times where pollution levels rise and may have negative impact on sensitive populations. 
			We recommend using the <a href="https://www.epa.gov/wildfire-smoke-course/communicating-air-quality-conditions-air-quality-index">EPA's Air Quality Index (AQI) ranges</a> to gauge when air quality may be impacting you and limit your exposure during these times.
			 
			<br/><br/>
			
			The best ways to reduce exposure to small particulate pollution are staying inside during pollution events, timing your outdoor exertion around times when air quality is best, and wearing a mask.&nbsp;
			<a href="https://www.iqair.com/newsroom/air-pollution-masks-what-works-what-doesn-t">N95 masks are capable of filtering out 95% of air particulates over 0.3 microns</a>, making them a great tool for reducing PM2.5 exposure. 

			<br/><br/>
			To reduce the level of indoor air pollution in your home, often just closing windows to reduce infiltration of outside air, turning off indoor pollution sources like gas stoves, and replacing your air filters regularly as instructed will do the trick. 
			However, for those who may be extra concerned due to pre-existing condition, a certified HEPA filter will produce optimal results.
			Here are some useful guides for improving indoor air quality: <a href="https://www.epa.gov/indoor-air-quality-iaq/improving-indoor-air-quality">the Environmental Protection Agency's Guide</a> and <a href="https://www.cdc.gov/respiratory-viruses/prevention/air-quality.html">the Center for Disease Control's Guide</a>.
		
			<br/><br/>
			It is also worth noting that sunlight warms ground-level which helps disperse pollution. 
			This means that we will generally experience the best air quality during the daytime, especially when skies are clear, though rain can also have a significantly positive effect on air quality as well.
			Conversely, we tend to experience the worst air quality overnight and on foggy mornings or cloudy evenings.
			</p>
	    </div>

	    {/* Contact Us */}
	    <div className="infoDiv">
			<h2 className="infoHeader">Contact Us</h2>
			<h3 className="miniInfoHeader">Share Feedback:</h3>
			<p className="infoParagraph">We would very much appreciate any feedback or suggestions on the website. 
			For now you can submit feedback to&nbsp;
			<a href="https://docs.google.com/forms/d/e/1FAIpQLSe21Vobf8oFnvnsSUp6Ru0wW0g5Xoceb27VNS_abwRut-pOoA/viewform">our Google form.</a>
			</p>
	
			<h3 className="miniInfoHeader">Get Involved:</h3>
			<p className="infoParagraph">If you would like to host an air monitor, get involved in our work, or just reach out to someone at Sustainable Upton, 
			you can reach us via email:&nbsp;
			<a href="mailto:sustainableuptonma@gmail.com">sustainableuptonma@gmail.com</a>
			<br/><br/>
			You can also find us on the <a href="https://www.facebook.com/groups/1669539636635991/">Sustainable Upton Facebook page</a>
			</p>
	    </div>
	</div>
    );
}

export default Landing;
