import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";
import Graph from './Graph';
import Banner from './Banner';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function SensorInfo({ sensor_id, dummy }) {
    const {API_URL} = useAppContext();
    const api = axios.create({
      baseURL: API_URL,
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sensorName, setSensorName] = useState('');
    const [contextIndex, setIndex] = useState(1);
    const {setDataContext} = useAppContext();

    const d = Date.now();
    const sec = 1000;
    const day = sec * 60 * 60 * 24;
    const week = day * 7;
    const end = Math.floor(d/sec);

    const dataContexts = [{context: "30-Day", timespan: "30 days", end: end, start: Math.floor((d-30*day)/sec)}, 
		{context: "7-Day", timespan: "7 days", end: end, start: Math.floor((d-week)/sec)}, 
		{context: "1-Day", timespan: "1 day", end: end, start: Math.floor((d-day)/sec)}, 
		{context: "6-Hour", timespan: "6 hours", end: end, start: Math.floor(d/sec-6*60*60)}];

    useEffect(() => {
	setSensorName(getObj("$" + sensor_id));
        //console.log(sensor_id);
        api.get('api/aqi/sensorinfo/'+sensor_id)
            .then(response => {
                //console.log(response);
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

    /*if (error) {
        return <h1>Error: {error.message}, Sensor ID: {sensor_id}</h1>;
    }*/

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

    const infoClick = (index) => {
	setIndex(index);
	setDataContext(dataContexts[index].context);
    };

    return (
	<div style = {{textAlign: "center",border: "5px solid black", width: "100%"}}>
	<center>
	    <h1 className="Marginless">Sensor: {sensorName}</h1>
	    <Banner avg={Math.round(100*data.banner_avg) / 100}/>

    	    <h1 className="Marginless">Recent AQI Averages:</h1>
            <div className="floatContainer" style={{display: 'flex', flexDirection: 'row', gap: '0'}}>
                {data.avgs.map((avg, index) => (
                    <div key={index} style={{ margin: "0", display: 'flex', flexDirection: 'column', width: "22%"}}>
                        <button className="floatBox" onClick={() => infoClick(index)} style={{fontSize: "24px", marginBottom: '0', height: '55px' }}>{dataContexts[index].context}</button>
                        <h1 className="floatBox" style={{backgroundColor: getObj(`X${Math.round(100 * avg) / 100}findcolorofAQI`), marginTop: '0', height: '35px' }}>{Math.round(100 * avg) / 100}</h1>
                    </div>
                ))}
            </div>
	    <Graph sensor_id={sensor_id} start={dataContexts[contextIndex].start} end={end} dummy={dummy}/> 
	</center>
	</div>
    );
}

export default SensorInfo;