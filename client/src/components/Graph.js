import Plot from 'react-plotly.js';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from "axios";
import VertAxis from "./VertAxis";
import { useAppContext } from "../AppContext";
import { graphUtil } from "../graphUtil";
import { getObj } from "../getObj";
import "../App.css";

function Graph({ sensor_id, start, end, dummy }) {
	/* Graph sensor_id's readings from start to end.
	 * Author: Keenan
	 * Note: dummy input so Map Buttons can force Graph to rerender when all other inputs are unchanges because the same button is pressed miltuple times to toggle data[where sensor = sensor_id].show  
	 */   	

	const [loading, setLoading] = useState(false);
    	const [error, setError] = useState(null);
	const ref = useRef(null);
	const [width, setWidth] = useState(1000);
	const [height, setHeight] = useState(300);

	const [data, setData] = useState([]); //entry format: {"data": [], "sensor": 0, "color": color, "show": False}
	const [lines, setLines] = useState([]);
	const [bars, setBars] = useState([]);

	//setup nBars slider functionality
	const [nBars, setN] = useState(50); 
	const handleSlider = (e) => {
	    setN(parseInt(e.target.value));
	};


	const {setGlobalLineBool} = useAppContext();
	const [lineBool, setLineBool] = useState(false);
	const [graphLayout, setGraphLayout] = useState({});
	
	//Handle timespan changes
	useEffect(() => {
	    setGraphLayout(lineGraphLayout(dayLightGradient(start, end, 500)));
	    //console.log("LAYOUT:",graphLayout);
	}, [start, end]);

	//Handle data changes
	useEffect(() => {
		if (lineBool)
			if(checkData()){
				setData(prev => prev.map(entry => entry.sensor===sensor_id ? ({...entry, showline:!entry.showline}):(entry)));
				return;
			}
		else
			if(checkData())
				return;
				
		axios.get('http://localhost:5000/api/aqi/time/' + start + "-" + end + '/' + sensor_id)
			.then(response => {
				setError(null);
				console.log("Sensor_id:", sensor_id);
				console.log("Server's Response", response);
				setData(prev => [...prev, {sensor:sensor_id, data:response.data.data, color:getObj("C"+sensor_id), showline:lineBool||sensor_id===0}]);
			}).catch(error => {
                    		console.error('Error fetching data:', error);
                    		setError(error.message);
                    		setLoading(false);
                	});
	}, [sensor_id, start, end, dummy]);

	/*useEffect(() => {
		setGraphLayout(prev => lineGraphLayout(prev.shapes));
	}, [width, height]);*/

  //formatLine: format a sensor's data entry into plotly line
  const formatLine = (l) => {
    //Takes in data 
    //console.log("Formatting line...");
    //console.log(l.data);
    let X  = [];
    let Y  = new Array(l.data.length);
    for(let i = 0; i < l.data.length; i++)
    { X[i] = l.data[i][0]*1000;
      Y[i] = l.data[i][1]; }
    //console.log(X);
    return { "x": X, "y": Y, type: "scatter", name: getObj("$"+l.sensor), mode: "lines", "marker": {"color": l.color}};
  }; 

  //check if data already exists for current sensor
  const checkData = () => {
    return data.some(entry => entry.sensor === sensor_id);
  };


  //get the bars for graphing current sensor
  const getBars = () => {
    //console.log("Filtered Data:",filteredData());
    const selectedData = filteredData().find(entry => entry.sensor === sensor_id);
    if(selectedData)
	return formatBars(selectedData, nBars);
    else
	return [];
  };
  const formatBars = (b, n) => {
    //console.log("Formatting Bars:", b);
    const step = (end-start)/n;
    let index = 0;
    let cutoff = start + step
    const X = new Array(n);
    const Y = new Array(n);
    let ty = 0;
    let x;
    let y;
    let count = 0;
    for(let i = 0; i < b.data.length; i++)
    { x = b.data[i][0]; 
      y = b.data[i][1];
      if(x >= cutoff){
        X[index] = (cutoff-.5*step)*1000;
	if(count != 0){
          Y[index] = ty/count;
        }else{
	  Y[index] = 0;
	}
	index++;
        cutoff += step;
        ty = 0;
        count = 0;
      }
      ty += y;
      count++;
    }
    return {"x": X, "y": Y, type: "bar", "marker": {"color": Y.map(v => colorMap(v))}};
  }; 

  //apply some transformation or filter to data
  const filteredData = () => {
	//console.log(data);
	return data;
  };

  const toggleLineBool = () => {
    let prevState = lineBool;
    setLineBool(!prevState); 
    setGlobalLineBool(!prevState);
  };
  const dayLightGradient = (start, end, n) => {
	const X = graphUtil("linspace")(start, end, n);
	//X is an array of unix timestamps, this function returns a list of plotly shapes to create a background gradient to show daylight
	const params = {
		fn: (x) => Math.abs((12*60*60)-(x-18000)%(24*60*60)),
		lo: 0,
		hi: 12*60*60,
		loColor: "rgb(176, 224, 230)",
		hiColor: "rgb(64, 125, 144)",
	};
	return graphUtil("getBlocks")(X, params, bgBlock());
  };

  //draw rectangle on graph to set gradient background
  const bgBlock = () => {
	return {
	  type: "rect",
	  x0: 0,
	  y0: 0,
	  x1: 1,
	  y1: 1,
	  xref: "paper",
	  yref: "paper",
	  fillcolor: "red",
	  opacity: 1,
	  layer: "below",
	  line: {
		color: "rgba(0,0,0,0)",
		width: 0
	  }
	};
  };

  const lineGraphLayout = (shapes) => {
	//console.log("Shapes:",shapes);
	return {
                width: width, 
                height: height,
		plot_bgcolor: "rgba(0,0,0,0)",
		paper_bgcolor: "rgba(0,0,0,0)",
                margin: {
                        l:25,
                        r:0,
                        t:0,
                        b:15
                },
                shapes: shapes,
                legend: {
                        visible: false
                },
                xaxis: {
                        type: "date",
                        //tickformat: "%h %b %d"
                }
	};
  };

  const colorMap = (val) => {
    const colors = getObj("c");
    const ranges = getObj("r");
    for(let i = 0; i < ranges.length; i++)
	if(val<ranges[i])
	    return colors[i];
    return colors[colors.length-1];
  };

if (loading)
	{return (<div className="loading-message">Loading...</div>);}
if (error)
	{return (<div className="error-message">Error: {error}</div>);}

return (
    <div className="Marginless">
        <h1 className="Marginless">7-Day AQI Readings</h1>
        <div className="graphContainer" ref={ref}>
            <button className="Button" onClick={toggleLineBool} style={{width:"30%"}}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<div>
		    <center>*Click a button on the map to toggle displaying it on the line graph</center>
		    <Plot data={filteredData().filter(entry => entry.showline).map(entry => formatLine(entry))} layout={graphLayout}/> /*RANGEBREAKS FOR X AXIS DATES?*/
		</div>
            ) : (
		<div>
		    <h2>Use slider to set number of bars:</h2>
		    <input
		        type="range"
		        min="7" //1 bar per day
		        max="1008" // 1 bar per sample
		        value={nBars}
		        onChange={handleSlider}
		        style={{ width: '100%' }}
		    />
		    <Plot data={[getBars()]} layout={graphLayout}/>
		</div>
            )}    
	    <center>*The graphs' color gradient shows the time of day with darker hues representing times closer to midnight.</center>
        </div>
    </div>
);

}

export default Graph;