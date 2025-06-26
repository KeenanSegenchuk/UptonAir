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
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [infoSensor, setInfoSensor] = useState(0);
    const [dummy, setDummy] = useState(false);

    //times
    const date = Date.now();
    const sec = 1000;
    const hour = sec * 60 * 60;

    //logic for mobile popup
    const {showPopup, setPopup} = useAppContext();

    const setSensorPos = (temp_data) => {
	//console.log("sensors:");
	//console.log(sensors);
	const ids = temp_data.map(sensors => sensors.id.toString());
	//console.log(ids);
	for (let i = 0; i <sensors.length; i++) {
		const id = sensors[i]["id"];
		const index = ids.indexOf(id); 
		//console.log("id,index");
		//console.log(id);
		//console.log(index);
		if(index >= 0)
			sensors[i].avg = temp_data[index].avg;
		else
			sensors[i].avg = -1;
	}
	setData(sensors);
	//console.log("SETTING BUTTONS", sensors);
    };
    

    const updateSensor = useCallback((newSensorValue) => {
	//console.log("Entering updateSensor... Dummy: ", dummy);
        setInfoSensor(newSensorValue);
	setDummy(prev => !prev); //Required to make repeated button clicks refresh graph since sensor_id could remain the same
    }, [dummy]);

    useEffect(() => {
	//init map button positions if data unavailable
	setSensorPos(sensors)

    });

    if (loading) {
        return <h1>Loading... </h1>;
    }

    //calculate avg for banner
    var count = 0;
    var total = 0;
    const averages = data.map(sensor => sensor.avg);
    //console.log("averages"  + averages);
    averages.forEach(avg => {
	if(!isNaN(avg)) {
		total = total + avg;
		count = count + 1;}
    })
    //console.log(total + ", " + count);

    //BAKCGROUND GRADIENT
    /* currently not used *
    const gradient = {
	background: "rgb(34,193,195)",
	background: "#E7D2AB",
	background: "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
    };                    */


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
		<Map className="floatBox" buttons={data} updateSensor={updateSensor} />
                <div className={`sensorInfo sinkBox ${showPopup ? "mobileOverlay open" : "hideMobile"}`}>
		    {/* Summary and Graph */}
       		    <SensorInfo id="infoBox" sensor_id={infoSensor} dummy={dummy}/>
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

