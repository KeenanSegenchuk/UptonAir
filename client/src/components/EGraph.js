import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState, useMemo } from 'react';
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
	const {dataContext, sensor_id, data, hover, switches, setPopup, units, lineUnits, lineMode} = useAppContext(); 
	const contexts = getObj("DataContexts");

    	const debug = false;
    	const log = (text, val = -1) => {
		if(debug && val === -1) console.log(text);
    		if(debug && val !== -1) console.log(text, val);
    	}
	log(`ECharts rerendering... Sensor: ${getObj("$"+sensor_id)} Context: ${dataContext} Units: ${units}`);
	log(`Data: `, data);

	//times
	const [end] = useState(() => Math.floor(Date.now() / 1000));
	const [start, setStart] = useState(end - contexts[dataContext]);
	useEffect(() => {setStart(end - contexts[dataContext]);
			 const maxN = contexts[dataContext]/600;
			 log(`Max N in context: ${maxN}... actual N: ${nBars}`);
			 if(maxN < nBars)
				setN(maxN);
	}, [dataContext, end, contexts]);

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

	//track component width
	const containerRef = useRef(null);
	const [width, setWidth] = useState(0);
	useEffect(() => {
	  const element = containerRef.current;
	  if (!element) return;
	  const ro = new ResizeObserver(([entry]) => {
	    const newWidth = entry.contentRect.width;
	    setWidth(prevWidth => {
	      // Only update if width changed to avoid rerenders
	      if (Math.abs(prevWidth - newWidth) > 30) {
	        return newWidth;
	      }
	      return prevWidth; // No change → no rerender
	    });
	  });
	  ro.observe(element);
	  return () => ro.disconnect();
	}, []);


	//set graph style for mobile/desktop
	const isMobile = window.matchMedia("(max-width: 767px)").matches;
	const graphStyle = isMobile
	  ? { width: `${width}px`, height: "250px" }
	  : { width: `${width}px`, height: "400px" };

	
	const gradConf = useMemo(() => (
	  isMobile
	    ? {
	        type: 'rect',
	        left: width / 10,
	        top: 60,
	        z: 0,
	        shape: {
	          width: 8 * width / 10,
	          height: 120,
	        }
	      }
	    : {
	        type: 'rect',
	        left: width / 10,
	        top: 50,
	        z: 0,
	        shape: {
	          width: 8 * width / 10,
	          height: 280,
	        }
	      }
	), [width]);


        //filter for current data context
        const filteredData = () => {
	    if (!data || !Array.isArray(data)) {
	        console.warn("Data is not ready or not an array:", data);
	        return [];
	    }
	    try {
		
	        console.log("In EGraph. Filtering Data...", data); 
	        /*console.log("Given context:", dataContext);
	        console.log("Units:", units);
		*/


	        let fd = data.filter(entry => entry.context === dataContext);
			
	        if (lineBool && lineMode === "sensors") 
			fd = fd.filter(entry => entry.showline); //isLineSelected(entry.sensor) 
		else
			fd = fd.filter(entry => entry.sensor === sensor_id);

		if (lineBool && lineMode === "units")
			fd = fd.filter(entry => lineUnits.includes(entry.units));
		else if (lineBool)
			fd = fd.filter(entry => entry.units === units);
		else 
			fd = fd.find(entry => entry.units === units);

		console.log("Filter Result:", fd);
		

	        return fd;
	    } catch (err) {
	        console.error("filteredData error:", err);
	        return [];
	    }
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
	}, [start, end, gradConf]);

  //Format data series for each line
	const formatLine = (l) => {
		return {
			type: "line",
			name: lineMode === "sensors" ? getObj("$"+l.sensor) : l.units,
			id: l.sensor + l.units,
			symbol: "none",
			lineStyle: {
				color: lineMode === "sensors" ? l.color : getObj(`UC${l.units}`)
			},
			itemStyle: {
				color: lineMode === "sensors" ? l.color : getObj(`UC${l.units}`)
			},
        		data: l.data.map(point => [point[0]*1000, point[1]]), 
		};
	};


    //check for missing units in line graph
    const missingLineData = () => {
	const missingLineUnits = lineUnits.filter(unit => {
	    return !data.some(entry =>
	        entry.sensor === sensor_id &&
	        entry.context === dataContext &&
	        entry.units === unit
	    );
	});
	return missingLineUnits; 
    };

  //get the bars for graphing current sensor
  const getBars = () => {
    const selectedData = filteredData(); //.find(entry => entry.sensor === sensor_id);
    //console.log("Selected Data:", selectedData);
    let response = { data: [[0,0]], type: "bar", name: "Empty", itemStyle: {color:"red"} };
    if(selectedData)
	response = formatBars(selectedData, nBars);
    log("nBars", nBars);
    log("Bar-Formatted Data:", response?.data?.map(e => e.value));
    return response;
  };

  //avg data into n bins of equal time-length
    const formatBars = (b, n) => {
	let bars = ["init"];
	try {
            bars = graphUtil("getBars")(b, n, start, end);
        } catch(error) {
	    console.log("Error binning data into bars.", bars);
	    console.log(`b: ${b}, n: ${n}, start: ${start}, end: ${end}`);
	    return bars;
	}
	if(bars.x) {
  	  bars = {
            type: "bar",
            name: getObj("$" + b.sensor),
            data: bars.x.map((timestamp, i) => ({
                value: [timestamp, bars.y[i]],
                itemStyle: { color: getObj(`X${bars.y[i]}${units}`) }
            }))
          };
	}
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

useEffect(() => {
    window.dispatchEvent(new Event('resize'));
}, []); 

return (
    <div id = "EGraph.js" className="Marginless">
        <h1 className="headerText">{dataContext} Readings ({getObj(`U${units}`)})</h1>
        <div className="graphContainer">
            <button className="Button hideMobile" onClick={toggleLineBool}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<div className="graphDiv" ref={containerRef}>
		    {!isMobile && lineMode === "sensors" ? <center style={{padding:"15px"}}>*Click a button on the map to toggle displaying it on the line graph</center> : <center style={{padding:"15px"}}>Sensor: {getObj('$' + sensor_id)}</center>} 
		    <ReactECharts key={dataContext} option={{...graphFormat, ...gradient, series: filteredData().map(formatLine)}}
    				style={graphStyle}
				notMerge={true}
				opts={{renderer:"svg"}}
		    />
		</div>
            ) : (
		<div className="graphDiv" ref={containerRef}>
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
        </div>
    </div>
);

}

export default EGraph;
