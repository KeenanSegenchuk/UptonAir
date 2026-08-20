import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
	const {dataContext, sensor_id, data, hover, switches, setPopup, units, lineUnits, lineMode, showCompression, showChatBox} = useAppContext(); 
	const contexts = getObj("DataContexts");
	const chartRef = useRef(null);

    	const debug = false;
    	const log = (text, val = -1) => {
		if(debug && val === -1) console.log(text);
    		if(debug && val !== -1) console.log(text, val);
    	}
	log(`ECharts rerendering... Sensor: ${getObj("$"+sensor_id)} Context: ${dataContext} Units: ${units}`);
	log(`Data: `, data);

	//communicate graph mode with map via app context
	const {globalLineBool, setGlobalLineBool} = useAppContext();
        const toggleLineBool = () => {
	    let prevState = globalLineBool;
	    setGlobalLineBool(!prevState);
        };

	//show line graph on mobile
	//use hover instead 
	useEffect(() => {
	    if(isMobile)
		if(hover === "Graph Multiple") {
		    setGlobalLineBool(true);
		    setPopup(true);
		}
	}, [hover]);

	useEffect(() => {
	    if(isMobile) 
		if(!switches.get("select")) {
		    setGlobalLineBool(false);
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

	//times
	const [end] = useState(() => Math.floor(Date.now() / 1000));
	const [start, setStart] = useState(end - contexts[dataContext]);
	useEffect(() => {setStart(end - contexts[dataContext]);
			const maxN = contexts[dataContext]/600;
			log(`Max N in context: ${maxN}... actual N: ${nBars}... chart width: ${width}`);
			/* 
			if(maxN < nBars)
				setN(maxN);
			*/
			if(maxN < width)
				setN(maxN);
			else
				setN(Math.floor(width));
	}, [dataContext, end, contexts]);

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
	    //filter logic now in appContext
	    const fd = (Array.isArray(data) ? data : [data]);
	    log("FILTERED DATA: ", fd);
	    if(globalLineBool || (showChatBox && showCompression)) {
	    	return fd; 
	    } else { return fd[0];}
        };


	//setup nBars slider functionality
	const iNit = isMobile ? 480 : 50;
	const [nBars, setN] = useState(iNit); 
	const handleSlider = (e) => {
	    setN(parseInt(e.target.value));
	};




  //Format data series for each line
	const formatLine = (l) => {
		return {
			type: "line",
			name: lineMode === "sensors" ? ((typeof l.sensor === "string" && !/\d/.test(l.sensor)) ? l.sensor : getObj("$" + l.sensor)) : l.units,
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
    log("Selected Data:", selectedData);
    let response = { data: [[0,0]], type: "bar", name: "Empty", itemStyle: {color:"red"} };

    if(selectedData?.data?.length >= nBars) {
	log("formatting bar using nBars...");
	response = formatBars(selectedData, nBars);
    }

    //this fails in cases with missing data the x data points could all be within 1/x th of the timeframe from eachother so theyre all in the same bar

    else if(selectedData?.data?.length) {
	log(`formatting bar using data len... ${selectedData?.data?.length}`);
	response = formatBars(selectedData, selectedData?.data?.length);
    }

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
	    log("Error binning data into bars.", bars);
	    log("b: ", b);
	    log(`n: ${n}, start: ${start}, end: ${end}`);
	    console.warn(error);
	    return bars;
	}
	if(bars.x) {
  	  bars = {
            type: "bar",
            name: (typeof b.sensor === "string" && !/\d/.test(b.sensor)) ? b.sensor : getObj("$" + b.sensor),
            data: bars.x.map((timestamp, i) => ({
                value: [timestamp, bars.y[i]],
                itemStyle: { color: getObj(`X${bars.y[i]}${units}`) }
            }))
          };
	}
	return bars;
    };

    // Sync legend visibility when globalLineBool changes
    useEffect(() => {
      setGraphFormat(prev => ({ ...prev, legend: { show: globalLineBool } }));
    }, [globalLineBool]);

    const [graphFormat, setGraphFormat] = useState({
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
	dataZoom: [
		{ type: 'slider', xAxisIndex: 0, start: 0, end: 100 },     // slider scroll/zoom bar
		{ type: 'inside', xAxisIndex: 0 }      // inside zoom / pan (mouse wheel / touch / drag)
	],
    	tooltip: {
        	trigger: 'axis'
	},
	legend: {
		show: globalLineBool //&& !isMobile
	}
    }); 
    const tickLabelFormats = [
	    function (value) {
        	const date = new Date(value);
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours === 0 ? 12 : hours;

                return `${hours}:${minutes}${ampm}`;
            },
            function (value) {
        	const date = new Date(value);
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                return `${month}/${day}`;
            }
    ];

    //when zoomed out enough to show one label per calendar date, build the list of
    //noon timestamps (ms) for each date in range so ticks land at noon instead of midnight
    const getNoonTickValues = (startSec, endSec) => {
	const ticks = [];
	if (!startSec || !endSec || startSec >= endSec) return ticks;

	let d = new Date(startSec * 1000);
	d.setHours(12, 0, 0, 0);
	if (d.getTime() < startSec * 1000) d.setDate(d.getDate() + 1);

	const endMs = endSec * 1000;
	//cap the number of generated ticks to avoid runaway loops on huge ranges
	for (let i = 0; d.getTime() <= endMs && i < 1000; i++) {
	    ticks.push(d.getTime());
	    d = new Date(d.getTime());
	    d.setDate(d.getDate() + 1);
	}
	return ticks;
    };

    //mobile only: the graph can only fit ~7 time-only tick labels before they overlap,
    //so evenly space maxTicks timestamps across the visible range instead of letting
    //echarts pick its own (denser) "nice" interval
    const getTimeTickValues = (startSec, endSec, maxTicks = 7) => {
	if (!startSec || !endSec || startSec >= endSec) return [];
	const startMs = startSec * 1000;
	const endMs = endSec * 1000;
	const stepMs = (endMs - startMs) / (maxTicks - 1);
	return Array.from({ length: maxTicks }, (_, i) => Math.round(startMs + i * stepMs));
    };

    //track zoom level
    const [gradient, setGradient] = useState({});
    const [zoom, setZoom] = useState({ start: start, end: end });

    //attached via onChartReady on each <ReactECharts> below so it's rebound
    //whenever the live instance changes (bar/line swap, key={dataContext} remount)
    //coalesced to 1/frame: a wheel-zoom burst fires many datazoom events, and since
    //the line chart re-renders with notMerge (full rebuild), reacting to every single
    //event races the chart's own tooltip DOM teardown and throws "el is null"
    const pendingZoom = useRef(null);
    const zoomFrame = useRef(null);
    const applyZoomRef = useRef(null);
    const handleZoom = useCallback((e) => {
	pendingZoom.current = e;
	if (zoomFrame.current) return;
	zoomFrame.current = requestAnimationFrame(() => {
	    zoomFrame.current = null;
	    applyZoomRef.current(pendingZoom.current);
	});
    }, []);
    //stable identity above so the onEvents object below doesn't change reference every
    //render (that would force echarts-for-react to dispose+recreate the chart on every
    //render); the ref lets it always call the latest applyZoom closure
    const onEvents = useMemo(() => ({ datazoom: handleZoom }), [handleZoom]);

    const applyZoom = (e) => {
	const zoomData = e.batch ? e.batch[0] : e;
	// Prefer startValue/endValue (real timestamps) when ECharts provides them. Some
	// dataZoom events (e.g. slider-driven or internally-synced ones) only carry
	// percent start/end - convert those using the fixed [start, end] extent the bars
	// are always plotted over, rather than reading the live chart's axis extent
	// (which raced with the [data] effect below and could bake in a too-narrow range).
	let startTime, endTime;
	if (zoomData.startValue != null && zoomData.endValue != null) {
	    startTime = zoomData.startValue / 1000;
	    endTime = zoomData.endValue / 1000;
	} else if (zoomData.start != null && zoomData.end != null) {
	    startTime = start + (zoomData.start / 100) * (end - start);
	    endTime = start + (zoomData.end / 100) * (end - start);
	} else {
	    return;
	}
	//trigger gradient update by setting zoom
        setZoom({ start: startTime, end: endTime });

	const formatIndex = (startTime + 2*24*60*60 < endTime) ? 1 : 0;
        const formatter = tickLabelFormats[formatIndex];
	//one tick per day at noon only looks reasonable up to ~10 days; beyond that, fall
	//back to echarts' own default tick placement so long ranges don't get a tick per day
	const rangeDays = (endTime - startTime) / (24*60*60);
	const noonTicks = formatIndex === 1
	    ? (rangeDays <= 10 ? getNoonTickValues(startTime, endTime) : undefined)
	    : (isMobile ? getTimeTickValues(startTime, endTime) : undefined);

	setGraphFormat(prev => ({
          ...prev,
          dataZoom: [
            { type: "slider", xAxisIndex: 0, start: zoomData.start, end: zoomData.end },
            { type: "inside", xAxisIndex: 0, start: zoomData.start, end: zoomData.end }
          ],
          xAxis: {
            ...prev.xAxis, // keep existing xAxis config
            axisLabel: {
              ...prev.xAxis?.axisLabel,
              formatter: formatter,
              customValues: noonTicks
            },
            axisTick: {
              customValues: noonTicks
            }
          }
        }));
    };
    applyZoomRef.current = applyZoom;

    useEffect(() => {
	return () => {
	    if (zoomFrame.current) cancelAnimationFrame(zoomFrame.current);
	};
    }, []);

    useEffect(() => {
	// Bars are always plotted over exactly [start, end] (see getBars in graphUtil.js),
	// so that's already the correct range for the default/unzoomed render - no need to
	// ask the chart for its live axis extent, which raced with applyZoom above.
	const formatIndex = (start + 2*24*60*60 < end) ? 1 : 0;
        const formatter = tickLabelFormats[formatIndex];
	//one tick per day at noon only looks reasonable up to ~10 days; beyond that, fall
	//back to echarts' own default tick placement so long ranges don't get a tick per day
	const rangeDays = (end - start) / (24*60*60);
	const noonTicks = formatIndex === 1
	    ? (rangeDays <= 10 ? getNoonTickValues(start, end) : undefined)
	    : (isMobile ? getTimeTickValues(start, end) : undefined);

	//update axis label setter, and reset the zoom slider/inside back to the full
	//range - otherwise a timespan change (e.g. switching dataContext) leaves the
	//dataZoom control showing whatever window the user had zoomed into previously
	setGraphFormat(prev => ({
              ...prev,
              dataZoom: [
                { type: "slider", xAxisIndex: 0, start: 0, end: 100 },
                { type: "inside", xAxisIndex: 0, start: 0, end: 100 }
              ],
              xAxis: {
                ...prev.xAxis, // keep existing xAxis config
                axisLabel: {
                  ...prev.xAxis?.axisLabel,
                  formatter: formatter,
                  customValues: noonTicks
                },
                axisTick: {
                  customValues: noonTicks
                }
              }
        }));
	setZoom({ start, end });

	log(`gradient... start:${start}, end:${end}`);
	setGradient({
	    graphic: [{
              ...gradConf,
              style: {
                fill: graphUtil("midnightGradient")(start, end, 500)
              },
	    }]
	});
    }, [start, end]);
    

    //Update daylight gradient when timespan changes
    useEffect(() => {
	log(`start:${start}, zoomedStart:${zoom.start}`);
	setGradient({
	    graphic: [{
              ...gradConf,
              style: {
                fill: graphUtil("midnightGradient")(zoom.start, zoom.end, 500)
              },
	    }]
	});
	//console.log("New gradient: ", gradient);
    }, [/*start, end, */zoom, gradConf]);


useEffect(() => {
    window.dispatchEvent(new Event('resize'));
}, []); 

return (
    <div tutorial-label="Graph" id = "EGraph.js" className="Marginless">
        <h1 className="headerText">{dataContext}{showCompression ? " Compressed " : " "}Readings {(!globalLineBool || lineMode === "sensors") && `(${units})`}</h1>
        <div className="graphContainer">
            {/*<button className="Button hideMobile" onClick={toggleLineBool}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>*/}
            {globalLineBool || (showCompression && showChatBox) ? (
		<div className="graphDiv" ref={containerRef}>
		    {lineMode === "sensors" ? <center style={{padding:"15px"}}>Multiple Sensors</center> : <center style={{padding:"15px"}}>Sensor: {getObj('$' + sensor_id)}</center>}
		    <div style={{ position: "relative" }}>
		      <ReactECharts key={dataContext}
				option={{...graphFormat, ...gradient, series: filteredData().map(formatLine)}}
    				style={graphStyle}
				notMerge={true}
				opts={{renderer:"svg"}}
				ref={chartRef}
				onEvents={onEvents}
		      />
		      {filteredData().length === 0 && (
		        <div style={{
		          position: "absolute", inset: 0,
		          display: "flex", alignItems: "center", justifyContent: "center",
		          backgroundColor: "rgba(255,255,255,0.7)",
		          pointerEvents: "none"
		        }}>
		          <span style={{ fontSize: "1.2em", color: "#555" }}>No data — select a sensor or wait for data to load</span>
		        </div>
		      )}
		    </div>
		</div>
            ) : (
		<div className="graphDiv" ref={containerRef}>
		    {/*<h2 className="Marginless hideMobile">Use slider to set number of bars:</h2>
		    <center><input className="Marginless hideMobile"
		        type="range"
		        min="7" //1 bar per day
		        max={(end-start)/600} // 1 bar per sample
		        value={nBars}
		        onChange={handleSlider}
		        style={{ width: '60%' }}
		    /></center>*/}
		    {/*<center style={{padding:"15px"}}>{getObj('$' + sensor_id)}, {dataContext} Historical Data</center>*/}
		    <div style={{ position: "relative" }}>
		      <ReactECharts option={{...graphFormat, ...gradient, series: [getBars()]}}
    				style={graphStyle}
				opts={{renderer:"svg"}}
				ref={chartRef}
				onEvents={onEvents}
		      />
		      {!filteredData()?.data?.length && (
		        <div style={{
		          position: "absolute", inset: 0,
		          display: "flex", alignItems: "center", justifyContent: "center",
		          backgroundColor: "rgba(255,255,255,0.7)",
		          pointerEvents: "none"
		        }}>
		          <span style={{ fontSize: "1.2em", color: "#555" }}>No data available</span>
		        </div>
		      )}
		    </div>
		</div>
            )}
	    <center className="bodyText">*The graphs' color gradient shows the time of day with darker hues representing times closer to midnight.</center>
        </div>
    </div>
);

}

export default EGraph;
