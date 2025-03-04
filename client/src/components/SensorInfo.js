import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";
import Graph from './Graph';
import Banner from './Banner';
import { getObj } from "../getObj";

function SensorInfo({ sensor_id, dummy }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphURL, setGraphURL] = useState('');
    const [sensorName, setSensorName] = useState('');

    const d = Date.now();
    const sec = 1000;
    const week = sec * 60 * 60 * 24 * 7;

    useEffect(() => {
	setSensorName(getObj("$" + sensor_id));
        //console.log(sensor_id);
        axios.get('http://localhost:5000/api/aqi/sensorinfo/'+sensor_id)
            .then(response => {
                console.log(response);
                setData(response.data);
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            }
	);
    }, [sensor_id]);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>Error: {error.message}, Sensor ID: {sensor_id}</h1>;
    }

    if (data === null) {
        return (
            <div>
                <center>
                    <h1>Click a button on the map to display averages.</h1>
                </center>
		<center>id: {sensor_id}</center>
            </div>
        );
    }

    return (
	<div style = {{textAlign: "center",border: "5px solid black", width: "100%"}}>
	<center>
	    <h1 className="Marginless">Sensor: {sensorName}</h1>
	    <Banner avg={Math.round(100*data.banner_avg) / 100}/>

    	    <h1 className="Marginless">Recent AQI Averages:</h1>
            <div className="floatContainer" style={{display: 'flex', flexDirection: 'row', gap: '0'}}>
                {data.inputs.map((input, index) => (
                    <div key={index} style={{ margin: "0", display: 'flex', flexDirection: 'column', width: "22%"}}>
                        <h1 className="floatBox" style={{ fontSize: "24px", marginBottom: '0', height: '35px' }}>{input}</h1>
                        <h1 className="floatBox" style={{ marginTop: '0', height: '35px' }}>{Math.round(100 * data.avgs[index]) / 100}</h1>
                    </div>
                ))}
            </div>
	    <Graph sensor_id={sensor_id} start={Math.floor((d-week)/sec)} end={Math.floor(d/sec)} dummy={dummy}/> 
	</center>
	</div>
    );
}

export default SensorInfo;