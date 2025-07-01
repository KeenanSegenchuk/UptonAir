import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";
//import Graph from './Graph';
import EGraph from './EGraph';
import Banner from './Banner';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function SensorInfo({ sensor_id, dummy }) {
    const {API_URL} = useAppContext();
    const api = axios.create({
      baseURL: API_URL,
    });
    //give option to close sensorinfo popup on mobile
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sensorName, setSensorName] = useState('');
    const [contextIndex, setIndex] = useState(1);
    const {setDataContext, setPopup} = useAppContext();

    const d = Date.now();
    const sec = 1000;
    const day = sec * 60 * 60 * 24;
    const week = day * 7;
    const end = Math.floor(d/sec);

    const dataContexts = [{context: "6-Month", end: end, start: Math.floor((d-180*day)/sec)}, 
		{context: "30-Day", end: end, start: Math.floor((d-30*day)/sec)}, 
		{context: "7-Day", end: end, start: Math.floor((d-week)/sec)}, 
		{context: "24-Hour", end: end, start: Math.floor((d-day)/sec)}];

    useEffect(() => {
	setSensorName(getObj("$" + sensor_id));
        //console.log(sensor_id);
        api.get('aqi/sensorinfo/'+sensor_id)
            .then(response => {
                //console.log(response);
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
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
	<div style = {{textAlign: "center", border: "5px solid black", width: "100%"}}>		    
	    <h1 className="headerText">Sensor: {sensorName}</h1>
	    <Banner avg={Math.round(100*data.banner_avg) / 100}/>

    	    <h1 className="headerText">Recent AQI Averages:</h1>
            <div className="floatContainer" style={{display: 'flex', flexDirection: 'row', gap: '0'}}>
                {data.avgs.map((avg, index) => (
                    <div key={index} style={{ margin: "0", display: 'flex', flexDirection: 'column', width: "22%"}}>
                        <button className="floatBox avgButton" onClick={() => infoClick(index)}>{dataContexts[index].context}</button>
                        <h1 className="floatBox avgBox" style={{backgroundColor: getObj(`X${Math.round(100 * avg) / 100}findcolorofAQI`)}}>{Math.round(100 * avg) / 100}</h1>
                    </div>
                ))}
            </div>
	    <EGraph sensor_id={sensor_id} start={dataContexts[contextIndex].start} end={end} dummy={dummy}/> 
	</div>
    );
}

export default SensorInfo;