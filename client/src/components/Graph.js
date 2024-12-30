
import React, { useEffect, useState, useCallback } from 'react';
import axios from "axios";
import Bar from "./Bar";
import DateComp from "./Date";
import LineGraph from "./LineGraph";
import { useAppContext } from "../AppContext";

//TODO: fix loading, horizontalize dates, display bars
function Graph({ sensor_id, start, end }) {
	const [nBars, setNBars] = useState(50);
	const [bars, setBars] = useState([]);
	const [AQI, setAQI] = useState([]);
	const [dates, setDates] = useState([]);
	const [gradient, setGradient] = useState("powderblue");
    	const [loading, setLoading] = useState(false);
    	const [error, setError] = useState(null);
	const [max, setMax] = useState(0);
	const [lines, setLines] = useState([]); //entry format: {"data": [], "sensor": []}
	const {graphUtil} = require("../graphUtil");
	const {getObj} = require("../getObj");
	const {setGlobalLineBool} = useAppContext();
	const [lineBool, setLineBool] = useState(false);

	//get data from api
	useEffect(() => {
            /*console.log(sensor_id);
	    //console.log(typeof start);
	    //console.log(typeof end);*/

	    if (lineBool) {/*TODO: CHECK IF SENSOR DATA ALREADY IN LINES AND REMOVE IT*/}

	    setLoading(true);
	    var dts = graphUtil("getTimes")(start, end, 7);
		dts = graphUtil("getDates")(dts);
	    var midnights = graphUtil("getMidnights")(start, end); 
		//midnights = midnights.slice(1,midnights.length - 1);
		console.log(midnights);
		midnights = graphUtil("midnightGradient")(start, end, midnights);
		console.log(midnights);
		setGradient(midnights.gradient);

	    /*console.log("dates:");
	    //console.log(dts);*/

	    setDates(dts);
            axios.get('http://localhost:5000/api/aqi/time/' + start + "-" + end + '/' + sensor_id)
                .then(response => {
		    setError(null);
                    console.log(response);
		    if (lineBool) {
                    	setLines(lines =>[...lines, {"data": response.data.data, "sensor": [sensor_id, getObj("$" + sensor_id)], "color": getObj("C" + sensor_id)}]);
		    }else{
			setAQI(response.data.data);
			const [brs, m] = graphUtil("getBars")(response.data.data.map(item => item[1]), nBars);
			setBars(brs);
			//console.log("bars" + bars);
			setMax(m);
		    }
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError(error.message);
                    setLoading(false);
                });
    	}, [sensor_id, start, end]);

	useEffect(() => {
		const [brs, m] = graphUtil("getBars")(AQI.map(item => item[1]), nBars);
		setBars(brs);
		setMax(m);
	}, [nBars]);

	useEffect(() => {
		setGlobalLineBool(lineBool);
	}, [lineBool]);

  const toggleLineBool = () => {
    let prevState = lineBool;
    setLineBool(!prevState); 
    setGlobalLineBool(!prevState);
  };

  const graphContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px'
  };

  const graphElement = {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    marginBottom: '5px',
    justifyContent: 'space-between',
  };

if (loading)
	{return (<div className="loading-message">Loading...</div>);}
if (error)
	{return (<div className="error-message">Error: {error}</div>);}

//TODO Add y-axis, fix x-axis
return (
  <div>
    <h1>7-Day AQI Readings</h1>
    <button onClick={toggleLineBool}>
      {lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
    </button>
    {lineBool ? (
      <LineGraph data={lines} gradient={gradient} />
    ) : (
      <div style={{ ...graphElement, border: "1px solid black", alignItems: "flex-end", height: "200px", width: "500px", background: gradient }}>
        {bars.map((bar, index) => (
          <Bar key={index} val={bar} max={max} />
        ))}
      </div>
    )}
    <div style={{ ...graphElement, height: "55px" }}>
      {dates.map((date, index) => (
        <DateComp key={index} text={date} />
      ))}
    </div>
  </div>
);
}

export default Graph;