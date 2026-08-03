import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../App.css";
//import Graph from './Graph';
import EGraph from './EGraph';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function SensorInfo2({ dummy }) {
    const {API_URL, sensor_id, setSensor_idAvgs} = useAppContext();
    const debug = false;
    const log = (text, val = -1) => {
	if(debug && val === -1) console.log(text);
    	if(debug && val !== -1) console.log(text, val);
    }
    log(`SensorInfo rerendering... Sensor: ${getObj("$" + sensor_id)}`);
    
    const api = axios.create({baseURL: API_URL + "data/",});
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contextIndex, setIndex] = useState(3);
    const {setDataContext, switches, units} = useAppContext();

    //working on making it combine timespan averages for multiple sensors/units (line graph)
    const {globalLineBool, lineMode, lineUnits, selectedSensors} = useAppContext();
    const getSelected = (o) => {return Object.keys(o).filter(k => o[k]);}
    const objLen = (o) => {return Object.values(o).filter(v => v).length;}

    const d = Date.now();
    const sec = 1000;
    const day = sec * 60 * 60 * 24;
    const week = day * 7;
    const end = Math.floor(d/sec);

    const dataContexts = [{context: "2-Year", end: end, start: Math.floor((d-365*day)/sec)},
		{context: "6-Month",  end: end, start: Math.floor((d-6*30*day)/sec)},
		{context: "30-Day", end: end, start: Math.floor((d-30*day)/sec)},
		{context: "7-Day", end: end, start: Math.floor((d-week)/sec)},
		//the last entry is consumed by the backend as the single banner_avg (1-hour) value, not part of avgs[]
		{context: "1-Hour", end: end, start: Math.floor((d-(day/24))/sec)}];

    const timeframes = dataContexts.map(e => String(e.context)).join(",");
    const starts = dataContexts.map(e => String(e.start)).join(",");

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
		
		let fd;
		if(globalLineBool && lineMode === "sensors" && objLen(selectedSensors) !== 1) {
			fd = (() => {
				let entries = data.filter(e => selectedSensors[e.sensor] && e.units === units).map(e => e.data);
				if(entries.length === 0) {return null;}
				log(entries);
				const lenAvgs = entries[0].avgs.length;
				return {
					avgs: Array.from({ length: lenAvgs}, (_, i) =>
						entries.reduce((sum, e) => sum + e.avgs[i], 0) / entries.length
					),
					banner_avg:
						entries.reduce((sum, e) => sum + e.banner_avg, 0) / entries.length
				};
			})();
		} else if(globalLineBool && lineMode === "sensors") {
		        fd = data.find(entry => entry.sensor === getSelected(selectedSensors)[0] && entry.units === units);
		} else {
		        fd = data.find(entry => entry.sensor === sensor_id && entry.units === units);
	        }
		log(`Filter Result: `, fd);
		
		return fd.data ? fd.data : (fd ? fd : {avgs: [-1, -1, -1, -1], banner_avg: -1});
	    } catch (err) {
	        console.error("filteredData error:", err);
	        return {avgs: [-1, -1, -1, -1], banner_avg: -1};
	    }
        };
	
    useEffect(() => {
	//keep timespan averages synced with selectedSensors
	const fd = filteredData();
	setSensor_idAvgs({...Object.fromEntries(fd.avgs.map((avg, index) => [dataContexts[index].context,avg])), "1-Hour":fd.banner_avg});
    }, [selectedSensors, lineUnits]);

    useEffect(() => {
	//update sensorInfo whenever sensor_id or units changes
	log(`Checking data from ${sensor_id} where units = ${units}`);

	if(checkData()) {
		const fd = filteredData();
		setSensor_idAvgs({...Object.fromEntries(fd.avgs.map((avg, index) => [dataContexts[index].context,avg])), "1-Hour":fd.banner_avg});
	} else {
          log(`Pulling data from ${sensor_id} where units = ${units}`);
          api.get(`sensorinfo/${units}/${sensor_id}/${timeframes}/${starts}`)
            .then(response => {
              log("queried api/sensorinfo. response:",  response.data);
              setData(prev => {
		const filtered = prev.filter(e => !(e.sensor === sensor_id && e.context === dataContexts[contextIndex].context && e.units === units));
		
		return [
                  ...filtered,
                  {
                    sensor: sensor_id,
                    context: dataContexts[contextIndex].context,
                    units: units,
                    data: response.data
                  }
              	];
	      });
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
        return (
            <div style={{ padding: "10px", width: "100%" }}>
                <div className="skeleton" style={{ height: "2em", width: "60%", margin: "10px auto" }} />
                <div className="skeleton" style={{ height: "60px", width: "80%", margin: "10px auto", borderRadius: "8px" }} />
                <div style={{ display: "flex", justifyContent: "center", gap: "2px", margin: "10px" }}>
                    {[0,1,2,3].map(i => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div className="skeleton" style={{ height: "40px" }} />
                            <div className="skeleton" style={{ height: "35px" }} />
                        </div>
                    ))}
                </div>
                <div className="skeleton" style={{ height: "300px", width: "100%", marginTop: "10px" }} />
            </div>
        );
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

    //friendly labels for the arrow buttons, keyed by dataContexts[].context
    const contextLabels = {
	"2-Year": "2 Year",
	"6-Month": "6 Month",
	"30-Day": "1 Month",
	"7-Day": "1 Week"
    };

    const avgs = filteredData().avgs;
    const len = dataContexts.length - 1; // exclude the trailing 1-Hour banner-only entry
    const prevIndex = (contextIndex - 1 + len) % len;
    const nextIndex = (contextIndex + 1) % len;

    const circleAvg = Math.round(100 * avgs[contextIndex]) / 100;
    const circleColor = getObj(`X${circleAvg}${units}`);
    const circleTextColor = getObj(`T${circleAvg}${units}`);
    const circleUnit = getObj(`U${units}`);
    //controls the circle's (and the flanking arrow buttons') size - adjust here
    const circleSize = "clamp(90px, 22vw, 170px)";

    return (
	<div id="SensorInfo.js" className="sensorDiv">
	    <div>
	        <h1 style={{fontSize:isMobile ? "1.5em" : "2.5em", padding: "10px"}} className="headerText">{`Current Sensor: ${lineMode==="sensors" && globalLineBool && objLen(selectedSensors) !== 1 ? "Multiple Sensors" : getObj("$"+sensor_id)}`}</h1>
	    </div>

	    <div className="floatContainer" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px', '--circle-size': circleSize}}>
                <button className="timeArrowButton" onClick={() => infoClick(prevIndex)}>
                    <span className="timeArrowGlyph">‹</span>
                    <span className="timeArrowLabel">{contextLabels[dataContexts[prevIndex].context]}</span>
                </button>
                <div className="bannerCircle" style={{backgroundColor: circleColor, color: circleTextColor}}>
                    <h1 className="bannerCircleText">{String(circleAvg)} {circleUnit}</h1>
                </div>
                <button className="timeArrowButton" onClick={() => infoClick(nextIndex)}>
                    <span className="timeArrowGlyph">›</span>
                    <span className="timeArrowLabel">{contextLabels[dataContexts[nextIndex].context]}</span>
                </button>
            </div>
	    <div className={ "showMobile" } style={{height:"25px"}}> </div>
	    <div className="hideMobile" style={{height:"25px"}}></div>
	    <EGraph sensor_id={sensor_id} start={dataContexts[contextIndex].start} end={end} dummy={dummy}/>
	</div>
    );
}

export default SensorInfo2;