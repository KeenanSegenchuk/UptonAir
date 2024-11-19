import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Graph from './Graph';

function SensorInfo({ sensor_id }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphURL, setGraphURL] = useState('');

    const d = Date.now();
    const sec = 1000;
    const week = sec * 60 * 60 * 24 * 7;

    useEffect(() => {
        if (sensor_id !== 0) {
            console.log(sensor_id);
            axios.get('http://localhost:5000/sensorinfo', { params: { sensor: sensor_id } })
                .then(response => {
                    console.log(response);
                    setData(response.data);
                    //setGraphURL(`data:image/png;base64,${response.data.graph}`); // Assuming `graphImage` is the base64-encoded image string
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError(error);
                    setLoading(false);
                });
        } else {
            setLoading(false);
	}
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


    const floatBox = {
	padding: "10px",
	border: "1px solid #000",
    };
    const floatContainer = {
	display: "flex", // Use flexbox for layout
	justifyContent: "space-around", // Optional, for spacing
    };
    return (
	<div>
	<center>
	    <h1>Sensor: {data.name}</h1>
	</center>
	<h1>Averages:</h1>
        <div style = {floatContainer}>
	    {data.inputs.map(input => (
                <h1 style = {floatBox}>{input}</h1>
            ))}
        </div>
	<div style = {floatContainer}>
	    {data.avgs.map(avg => (
                <h1 style = {floatBox}>{Math.round(100 * avg) / 100}</h1>
            ))}
        </div>
	{/* <h1 style={{textAlign: "center",}}>{data.graphTitle}</h1> */}
	{/*<img src={data.graphURL} alt="failed to load graph"/> */}
	<Graph sensor_id={sensor_id} start={Math.floor((d-week)/sec)} end={Math.floor(d/sec)}/> 
	</div>
    );
}

export default SensorInfo;