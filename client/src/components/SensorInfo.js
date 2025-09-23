import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";
//import Graph from './Graph';
import EGraph from './EGraph';
import Banner from './Banner';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function SensorInfo({ dummy }) {
    const {API_URL, sensor_id} = useAppContext();
    const api = axios.create({
      baseURL: API_URL,
    });

    const debug = true;
    const log = (text, val = -1) => {
	if(debug && val === -1) console.log(text);
    	if(debug && val !== -1) console.log(text, val);
    }
    log(`SensorInfo rerendering... Sensor: ${getObj("$" + sensor_id)}`);

    //give option to close sensorinfo popup on mobile
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextIndex, setIndex] = useState(2);
    const {setDataContext, setPopup, switches, units} = useAppContext();
    const mobileMultiSelect = switches.get("select");

    const d = Date.now();
    const sec = 1000;
    const day = sec * 60 * 60 * 24;
    const week = day * 7;
    const end = Math.floor(d/sec);

    const dataContexts = [{context: "6-Month", end: end, start: Math.floor((d-180*day)/sec)}, 
		{context: "30-Day", end: end, start: Math.floor((d-30*day)/sec)}, 
		{context: "7-Day", end: end, start: Math.floor((d-week)/sec)}, 
		{context: "24-Hour", end: end, start: Math.floor((d-day)/sec)}];

    //check if data already exists for current sensor
    const checkData = () => {
        return data.some(entry => entry.sensor === sensor_id && entry.units === units);
    };

    //filter for current data context
    const filteredData = () => {
	    if (!data || !Array.isArray(data)) {
	        console.warn("Data is not ready or not an array:", data);
	        return [];
	    }
	    try {
	        log(`In SensorInfo. Filtering Data...`, data); 
	        log(`Given context: ${dataContexts[contextIndex].context}`);
	        log(`Units: ${units}`);
		
	        const fd = data.find(entry => entry.sensor === sensor_id && entry.units === units);
	        log(`Filter Result: `, fd);
		
		return fd ? fd.data : {avgs: [-1, -1, -1, -1], banner_avg: -1};
	    } catch (err) {
	        console.error("filteredData error:", err);
	        return {avgs: [-1, -1, -1, -1], banner_avg: -1};
	    }
        };
	

    useEffect(() => {
        log(`Checking data from ${sensor_id} where units = ${units}`);
	if (!checkData()) {
          log(`Pulling data from ${sensor_id} where units = ${units}`);
          api.get(`sensorinfo/${units}/${sensor_id}`)
            .then(response => {
              log("queried api/sensorinfo. response:",  response.data);
              setData(prev => [
                ...prev,
                {
                  sensor: sensor_id,
                  context: dataContexts[contextIndex].context,
                  units: units,
                  data: response.data
                }
              ]);
              setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
	  );
	}
    }, [sensor_id, units]);

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
	<div id="SensorInfo.js" className="sensorDiv">
	    <div className={mobileMultiSelect ? "hideMobile" : ""}>		    
	        <h1 style={{fontSize:isMobile ? "1.5em" : "3em", padding: "10px"}} className="headerText">Current Sensor: {getObj("$" + sensor_id)} [{getObj(`W${units}`)}]</h1>
	        <Banner avg={Math.round(100*filteredData().banner_avg) / 100} units = {units}/>

    	        <h1 className="headerText">Recent Averages ({getObj(`U${units}`)})</h1>
	    </div>

	    <h1 className={`headerText ${mobileMultiSelect ? "showMobile" : "hide"}`}>Choose Timeframe</h1>

            <div className="floatContainer" style={{display: 'flex', flexDirection: 'row', gap: '0'}}>
                {filteredData().avgs.map((avg, index) => {
		  log(`${dataContexts[index].context} avg : ${avg}`);
		  return (
                    <div key={index} style={{ margin: "0", display: 'flex', flexDirection: 'column', width: "22%"}}>
                        <button className="floatBox avgButton" onClick={() => infoClick(index)}
				style={index === contextIndex ? { backgroundColor: "#444", color: "white" } : {}}>{dataContexts[index].context}</button>
                        <h1 className={`floatBox avgBox ${mobileMultiSelect ? "hideMobile" : ""}`} style={{backgroundColor: getObj(`X${Math.round(100 * avg) / 100}${units}`)}}>{Math.round(100 * avg) / 100}</h1>
                    </div>
                  );
		})}
            </div>
	    <div className={mobileMultiSelect ? "showMobile" : "hide"} style={{height:"25px"}}> </div>
	    <div classname="hideMobile" style={{height:"25px"}}></div>
	    <EGraph sensor_id={sensor_id} start={dataContexts[contextIndex].start} end={end} dummy={dummy}/> 
	</div>
    );
}


export default SensorInfo;
