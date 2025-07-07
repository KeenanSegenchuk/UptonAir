import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from "../AppContext";
import { graphUtil } from "../graphUtil";
import { getObj } from "../getObj";
import "../App.css";

function EGraph() {
	/* Graph sensor_id's readings from times start to end.
	 * Author: Keenan
	 * Note: dummy input so Map Buttons can force Graph to rerender when all other inputs are unchanges because the same button is pressed miltuple times to toggle data[where sensor = sensor_id].show  
	 */   	

	//setup data management
	const {dataContext, sensor_id, data, hover, switches, setPopup} = useAppContext(); 
	const contexts = getObj("DataContexts");

	//times
	const [end] = useState(() => Math.floor(Date.now() / 1000));
	const [start, setStart] = useState(end - contexts[dataContext]);
	useEffect(() => {setStart(end - contexts[dataContext]);}, [dataContext, end, contexts]);

	//communicate graph mode with map via app context
	const {setGlobalLineBool} = useAppContext();
	const [lineBool, setLineBool] = useState(false);
        const toggleLineBool = () => {
	    let prevState = lineBool;
	    setLineBool(!prevState); 
	    setGlobalLineBool(!prevState);
        };

	//show line graph on mobile
	//use hover instead 
	useEffect(() => {
	    if(isMobile)
		if(hover === "Graph Multiple") {
		    setGlobalLineBool(true);
		    setLineBool(true);
		    setPopup(true);
		}
	}, [hover]);

	useEffect(() => {
	    if(isMobile) 
		if(!switches.get("select")) {
		    setGlobalLineBool(false);
		    setLineBool(false);
		}
	}, [switches]);


	//set graph style for mobile/desktop
	const isMobile = window.matchMedia("(max-width: 767px)").matches;
	const graphStyle = isMobile
	  ? { width: "100%", height: "250px" }
	  : { width: "900px", height: "400px" };

	
	const gradConf = {
		type:"rect",
		z: 0,
		coords: [
		  ["min","min"],
		  ["max","max"]
		]
	};
	/*const gradConf = isMobile
	  ? {
	      type: 'rect',
	      left: 40,
	      top: 60,
	      z: 0,
	      shape: {
	        width: 320,
	        height: 120,
	      }
	}  :  {
	      type: 'rect',
	      left: 90,
	      top: 50,
	      z: 0,
	      shape: {
	        width: 720,
	        height: 280,
	      }
	};*/
        //filter for current data context
        const filteredData = () => {
	    //console.log("Filtering Data...", data.map(entry => entry.context)); 
	    //console.log("Given context:", dataContext);
  	    const fd = data.filter(entry => entry.context === dataContext);  
	    //console.log("Filter Result:", fd);
	    return fd;
        };

	//setup nBars slider functionality
	const iNit = isMobile ? 480 : 50;
	const [nBars, setN] = useState(iNit); 
	const handleSlider = (e) => {
	    setN(parseInt(e.target.value));
	};

 	//Update daylight gradient when timespan changes
	const [gradient, setGradient] = useState({});
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
    const selectedData = filteredData().find(entry => entry.sensor === sensor_id);
    //console.log("Selected Data:", selectedData);
    let response = { data: [[0,0]], type: "bar", name: "Empty", itemStyle: {color:"red"} };
    if(selectedData)
	response = formatBars(selectedData, nBars);
    //console.log("Bar-Formatted Data:", response);
    return response;
  };

  //avg data into n bins of equal time-length
    const formatBars = (b, n) => {
	let bars = ["init"];
	try {
            bars = graphUtil("getBars")(b, n, start, end);
        } catch(error) {
	    console.log("Error binning data into bars.");
	    return bars;
	}
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

    const graphFormat = {
	xAxis: {
		type: 'time',
                axisLabel: {
                    formatter: function (value) {
                        const date = new Date(value);

                        if (dataContext === "24-Hour") {
                            let hours = date.getHours();
                            const minutes = date.getMinutes().toString().padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12;
                            hours = hours === 0 ? 12 : hours;

                            return `${hours}:${minutes}${ampm}`;
                        } else {
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            return `${month}/${day}`;
                        }
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
		show: lineBool //&& !isMobile
	}
    };

return (
    <div className="Marginless">
        <h1 className="headerText">{dataContext} AQI Readings</h1>
        <div className="graphContainer">
            <button className="Button hideMobile" onClick={toggleLineBool}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<div className="graphDiv">
		    {!isMobile && <center style={{padding:"15px"}}>*Click a button on the map to toggle displaying it on the line graph</center>} 
		    <ReactECharts key={dataContext} option={{...graphFormat, ...gradient, series: filteredData().filter(entry => entry.showline).map(formatLine)}}
    				style={graphStyle}
				notMerge={true}
				opts={{renderer:"svg"}}
		    />
		</div>
            ) : (
		<div className="graphDiv">
		    <h2 className="Marginless hideMobile">Use slider to set number of bars:</h2>
		    <center><input className="Marginless hideMobile"
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
	    {isMobile && <center className="bodyText">*Opening a popup while in line graph mode will automatically select that that sensor to be shown on the line graph.</center>}
        </div>
    </div>
);

}

export default EGraph;
