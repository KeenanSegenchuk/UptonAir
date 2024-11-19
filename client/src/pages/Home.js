import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'
import Map from "../components/Map";
import Banner from "../components/Banner";
import SensorInfo from "../components/SensorInfo";

function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [infoSensor, setInfoSensor] = useState(0);

    const updateSensor = useCallback((newSensorValue) => {
        setInfoSensor(newSensorValue);
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/map')
            .then(response => {
                console.log(response);
                setData(response.data);
                setLoading(false);
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
    averages.forEach(avg => {
	total = total + avg;
	count = count + 1;
    })

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
	<div>
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

