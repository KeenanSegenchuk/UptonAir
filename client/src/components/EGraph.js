import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { useAppContext } from "../AppContext";
import { graphUtil } from "../graphUtil";
import { getObj } from "../getObj";
import "../App.css";

function EGraph({ }) {
	/* Graph sensor_id's readings from times start to end.
	 * Author: Keenan
	 * Note: dummy input so Map Buttons can force Graph to rerender when all other inputs are unchanges because the same button is pressed miltuple times to toggle data[where sensor = sensor_id].show  
	 */   	

	//Copy api url from appcontext 
	const {API_URL} = useAppContext();
	const api = axios.create({
          baseURL: API_URL,
	});


	//setup data management
	const {dataContext, sensor_id, data, setData} = useAppContext(); 
	const contexts = getObj("DataContexts");

	//times
	const [end] = useState(() => Math.floor(Date.now() / 1000));
	const [start, setStart] = useState(end - contexts[dataContext]);
	useEffect(() => {setStart(end - contexts[dataContext]);}, [dataContext, end]);

	const [loading, setLoading] = useState(false);
	const ref = useRef(null);	

	//set graph style for mobile/desktop
	const isMobile = window.matchMedia("(max-width: 767px)").matches;
	const graphStyle = isMobile
	  ? { width: "300px", height: "200px" }
	  : { width: "600px", height: "400px" };
	const gradConf = isMobile
	  ? {
	      type: 'rect',
	      left: 30,
	      top: 60,
	      z: 0,
	      shape: {
	        width: 240,
	        height: 70,
	      }
	}  :  {
	      type: 'rect',
	      left: 60,
	      top: 50,
	      z: 0,
	      shape: {
	        width: 480,
	        height: 280,
	      }
	};

        //filter for current data context
        const filteredData = () => {
	    //console.log("Filtering Data...", data.map(entry => entry.context)); 
	    //console.log("Given context:", dataContext);
  	    const fd = data.filter(entry => entry.context === dataContext);  
	    console.log("Result:", fd);
	    return fd;
        };

	//setup nBars slider functionality
	const iNit = isMobile ? 240 : 50;
	const [nBars, setN] = useState(iNit); 
	const handleSlider = (e) => {
	    setN(parseInt(e.target.value));
	};

	//communicate graph mode with map via app context
	const {setGlobalLineBool} = useAppContext();
	const [lineBool, setLineBool] = useState(false);
        const toggleLineBool = () => {
	    let prevState = lineBool;
	    setLineBool(!prevState); 
	    setGlobalLineBool(!prevState);
        };

	const [gradient, setGradient] = useState({});
 	//Update daylight gradient when timespan changes
	useEffect(() => {
		setGradient({
		    graphic: [{
	              ...gradConf,
	              style: {
	                fill: graphUtil("midnightGradient")(start, end, 500)
	              },
		    }]
		});
		//console.log("New gradient: ", gradient);
	}, [start, end]);

  //Format data series for each line
	const formatLine = (l) => {
		return {
			type: "line",
			name: getObj("$"+l.sensor),
			id: l.sensor,
			symbol: "none",
			lineStyle: {
				color: l.color
			},
			itemStyle: {
				color: l.color
			},
        		data: l.data.map(point => [point[0]*1000, point[1]]), 
		};
	};



  //get the bars for graphing current sensor
  const getBars = () => {
    const selectedData = filteredData().find(entry => entry.sensor == sensor_id);
    //console.log("Selected Data:", selectedData);
    let response = { data: [[1,1]], type: "bar", name: "Empty", itemStyle: {color:"red"} };
    if(selectedData)
	response = formatBars(selectedData, nBars);
    //console.log("Bar-Formatted Data:", response);
    return response;
  };

  //avg data into n bins of equal time-length
    const formatBars = (b, n) => {
        let bars = graphUtil("getBars")(b, n, start, end);
        bars = {
            type: "bar",
            name: getObj("$" + b.sensor),
            data: bars.x.map((timestamp, i) => ({
                value: [timestamp, bars.y[i]],
                itemStyle: { color: bars.marker.color[i] }
            }))
        };
	return bars;

    };



    const colorMap = (val) => {
	const colors = getObj("c");
	const ranges = getObj("r");
	for(let i = 0; i < ranges.length; i++)
		if(val<ranges[i])
			return colors[i];
	return colors[colors.length-1];
    };

    const graphFormat = {
	xAxis: {
		type: 'time',
                axisLabel: {
                  formatter: function (value) {
                    const date = new Date(value);
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
                    const day = date.getDate().toString().padStart(2, '0');
                    return `${month}/${day}`;
                  }
                }
	},
	yAxis: {
 		type: 'value',
		min: function (value) {
		    return value.min < 0 ? -3 : 0;
		  }
    	},
    	tooltip: {
        	trigger: 'axis'
	},
	legend: {
		show: !isMobile && lineBool
	}
    };

if (loading)
	{return (<div className="loading-message">Loading...</div>);}

return (
    <div className="Marginless">
        <h1 className="headerText">{dataContext} AQI Readings</h1>
        <div className="graphContainer" ref={ref}>
            <button className="Button" onClick={toggleLineBool}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<div>
		    {!isMobile && <center>*Click a button on the map to toggle displaying it on the line graph</center>} 
		    <ReactECharts option={{...graphFormat, ...gradient, series: filteredData().filter(entry => entry.showline).map(formatLine)}}
    				style={graphStyle}
				notMerge={true}
				opts={{renderer:"svg"}}
		    />
		</div>
            ) : (
		<div>
		    <h2 className="hideMobile">Use slider to set number of bars:</h2>
		    <center><input className="hideMobile"
		        type="range"
		        min="7" //1 bar per day
		        max={(end-start)/600} // 1 bar per sample
		        value={nBars}
		        onChange={handleSlider}
		        style={{ width: '60%' }}
		    /></center>
    		    {/* Log changes before render for debugging */}
		    
		    <ReactECharts option={{...graphFormat, ...gradient, series: [getBars()]}}
    				style={graphStyle}
				opts={{renderer:"svg"}}
		    />
		</div>
            )}    
	    <center className="bodyText">*The graphs' color gradient shows the time of day with darker hues representing times closer to midnight.</center>
        </div>
    </div>
);

}

export default EGraph;
