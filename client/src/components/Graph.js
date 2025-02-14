import Plot from 'react-plotly.js';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from "axios";
import Bar from "./Bar";
import DateComp from "./Date";
import LineGraph from "./LineGraph";
import VertAxis from "./VertAxis";
import { useAppContext } from "../AppContext";
import { graphUtil } from "../graphUtil";
import { getObj } from "../getObj";
import "../App.css";

//TODO: fix loading, horizontalize dates, display bars
function Graph({ sensor_id, start, end, dummy }) {
    	const [loading, setLoading] = useState(false);
    	const [error, setError] = useState(null);
	const ref = useRef(null);
	const [width, setWidth] = useState(1000);
	const [height, setHeight] = useState(300);

	/*
	const initUpdateSize = () => {
	    const initWindowSize = [window.innerWidth, window.innerHeight];
            const initGraphSize = [1000, 300];
            return () => {
		//console.log("Current Width, Height: ", width, height);
		//console.log("New Window Width, Height: ", window.innerWidth, window.innerHeight);
		//console.log("Expected Width, Height: ", initGraphSize[0] * (window.innerWidth/initWindowSize[0]), initGraphSize[1]* (window.innerHeight/initWindowSize[1]));
                setWidth(initGraphSize[0] * (window.innerWidth / initWindowSize[0]));
                setHeight(initGraphSize[1] * (window.innerHeight / initWindowSize[1]));
            };
	};

	useEffect(() => {
	    const updateFN = initUpdateSize();
	    window.addEventListener("resize", updateFN);
	    return () => {
		window.removeEventListener("resize", updateFN);
	    };
	}, []); 
	*/

	const [lines, setLines] = useState([]); //entry format: {"data": [], "sensor": 0, "show": False}
	const [bars, setBars] = useState([]);
	const nBars = 50;
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
			if(checkForLine(sensor_id))
				return;
	
		axios.get('http://localhost:5000/api/aqi/time/' + start + "-" + end + '/' + sensor_id)
			.then(response => {
				setError(null);
				//console.log(response);
				if(lineBool){
					addLine(response.data.data);
				}else{
					//console.log("BARS: ", formatBars(response.data, nBars));
					setBars(formatBars(response.data, nBars));
				}
			}).catch(error => {
                    		console.error('Error fetching data:', error);
                    		setError(error.message);
                    		setLoading(false);
                	});
	}, [sensor_id, start, end]);

	//use dummy change to force updates when same button is consecutively pressed
	useEffect(() => {
		console.log("CLICK!!!");
		if (lineBool)
			if(checkForLine(sensor_id))
				return;
	}, [dummy]);
	//push width, height changes to plot
	/*useEffect(() => {
		setGraphLayout(prev => lineGraphLayout(prev.shapes));
	}, [width, height]);*/
	
  const addLine = (response) => {
    let l = {"data": response, "sensor": sensor_id, "color":getObj("C"+sensor_id), "show": true}
    setLines(prevItems => [...prevItems, l]);
    return;
  };

  const checkForLine = () => {
    if(lines.some(item=>item.sensor===sensor_id))
    { 
      const newLines = lines.map(item=>item.sensor===sensor_id ? {...item, show: !item.show} : item);
      setLines(newLines);
      return true;
    }
    return false;
  };

  const formatLine = (l) => {
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

  const newBar = (b) => {
    const x = new Array(b.data.length);
    const y = new Array(b.data.length);
    for(let i = 0; i < b.data.length; i++)
    { x[i] = b.data[i][0];
      y[i] = b.data[i][1]; }
    return { "x": x, "y": y, type: "scatter", mode: "bar", "marker": {"color": b.color}};
  }; 

  const formatBars = (b, n) => {
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
    <div>
        <h1>7-Day AQI Readings</h1>
        <div className="graphContainer" ref={ref}>
            <button className="Button" onClick={toggleLineBool} style={{width:"30%"}}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<Plot data={lines.filter(l => l.show).map(l => formatLine(l))} layout={graphLayout}/> /*RANGEBREAKS FOR X AXIS DATES?*/
            ) : (
		<Plot data={[bars]} layout={graphLayout}/>
            )}
        </div>
    </div>
);

}

export default Graph;