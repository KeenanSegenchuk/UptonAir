import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'
import Map from "../components/Map";
import Banner from "../components/Banner";
import SensorInfo from "../components/SensorInfo";
const { getObj } = require("../getObj");
const sensors = getObj("positions");


function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [infoSensor, setInfoSensor] = useState(0);
    const sensorPos = "/sensor-pos.json";

    const setSensorPos = (temp_data) => {
	console.log("sensors:");
	console.log(sensors);
	const ids = sensors.map(sensors => sensors.id);
	console.log(ids);
	for (let i = 0; i <temp_data.length; i++) {
		const id = temp_data[i]["id"];
		const index = ids.indexOf(id.toString()); 
		console.log("id,index");
		console.log(id);
		console.log(index);
		temp_data[i]["name"] = sensors[index]["name"];
		temp_data[i]["x"] = sensors[index]["x"];
		temp_data[i]["y"] = sensors[index]["y"];
	}
	setData(temp_data);
	console.log(temp_data);
    };

    const updateSensor = useCallback((newSensorValue) => {
        setInfoSensor(newSensorValue);
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/api/aqi/avg/1%20hour')
            .then(response => {
                console.log(response);
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
        return <h1>Loading...</h1>;
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
	background: "rgb(34,193,195)",
	background: "linear-gradient(0deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)",
    };

    //define float css
    const sinkBox = {
	width: "100%",
	padding: "10px",
    };
    const floatBox = {
	padding: "10px",
	border: "1px solid #000",
	width: "90%",
    };
    const floatButton = {
	marginTop: "15%",
	width: "100%",
	height: "70%",
    };
    const floatContainer = {
	display: "flex", // Use flexbox for layout
	justifyContent: "space-around", // Optional, for spacing
    };

    return (
	<div style = {gradient}>
            <div style = {floatContainer}>
                <p>
              This is the home page. Click on the button below to learn more about us, or contact us if you want to learn more!
                </p>
                <Link to="/about"><button style={floatButton}>
              About Us
                </button>
                </Link>
                <Link to="/contact"><button style={floatButton}>
              Contact Us
                </button>
                </Link>
            </div>
            <h1 style = {{textAlign: "center", width: "100%", height: "65px", background: "#38ba5b",}}>Upton Air</h1>
            <div style = {floatContainer}>
                <Map style = {floatBox} buttons={data} updateSensor={updateSensor} />
                <div style={{ width: "90%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        	    <Banner style={floatBox} avg={Math.round(100 * total / count) / 100} />
       		    <SensorInfo id="infoBox" sensor_id={infoSensor} style={sinkBox}/>
      		</div> 
            </div>
	</div>
    );
}

export default Home;

