import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import "../App.css";
import { Link } from 'react-router-dom'
import Map from "../components/Map";
import Banner from "../components/Banner";
import SensorInfo from "../components/SensorInfo";
import HoverButton from "../components/HoverButton";
import LinkButton from "../components/LinkButton";
import ToggleButton from "../components/ToggleButton";
import InfoContainer from "../components/InfoContainer";
import Graph from "../components/Graph";
const { getObj } = require("../getObj");
const sensors = getObj("positions");



function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [infoSensor, setInfoSensor] = useState(0);
    const sensorPos = "/sensor-pos.json";
    const [dummy, setDummy] = useState(false);
    const date = Date.now();
    const sec = 1000;
    const hour = sec * 60 * 60;
    const week = hour * 24 * 7;

    const setSensorPos = (temp_data) => {
	console.log("sensors:");
	console.log(sensors);
	const ids = sensors.map(sensors => sensors.id);
	//console.log(ids);
	for (let i = 0; i <temp_data.length; i++) {
		const id = temp_data[i]["id"];
		const index = ids.indexOf(id.toString()); 
		//console.log("id,index");
		//console.log(id);
		//console.log(index);
		temp_data[i]["name"] = sensors[index]["name"];
		temp_data[i]["x"] = sensors[index]["x"];
		temp_data[i]["y"] = sensors[index]["y"];
	}
	setData(temp_data);
	//console.log("SETTING BUTTONS", temp_data);
    };
    

    const updateSensor = useCallback((newSensorValue) => {
	console.log("Entering updateSensor... Dummy: ", dummy);
        setInfoSensor(newSensorValue);
	setDummy(prev => !prev); //Required to make repeated button clicks refresh graph since sensor_id could remain the same
    }, []);

    useEffect(() => {
	//init map button positions if data unavailable
	setSensorPos(sensors)
        axios.get('http://localhost:5000/api/aqi/avg/'+(Math.floor((date-hour)/sec)+"-"+Math.floor(date / sec)))
            .then(response => {
                console.log("Homepage API Response:",response);
                var temp_data = response.data;
                setLoading(false);
		setSensorPos(temp_data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h1>Loading... </h1>;
    }

    if (error) {
        return <h1>Error: {error.message}</h1>;
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
    const gradient = {
	background: "#4f99c6",
	/*background: "rgb(34,193,195)",
	background: "#E7D2AB",
	background: "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
	*/
    };


    return (
	<div className="blue" style = {{ height: '100vh', overflow: 'scroll' }}>

	    {/*Header*/}
	    <div className="title" style={{display:"flex", aligItems:"center", flexDirection:"horizontal"}}>
                <h1 className="titleText">Upton Air</h1>
	        <LinkButton style={{marginLeft:"auto", marginRight: "0"}} text="Get Notified" href="http://localhost:3000/alerts"/>
	    </div>

	    {/*Page Body*/}
            <div className="floatContainer" >
                {/* Map */}
		<Map className="floatBox" buttons={data} updateSensor={updateSensor} />
                <div className="sinkContainer sensorInfo">
		    {/* Summary and Graph */}
       		    <SensorInfo className="sinkBox" id="infoBox" sensor_id={infoSensor} dummy={dummy}/>
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

