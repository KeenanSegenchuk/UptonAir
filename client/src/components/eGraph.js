import ReactECharts from 'echarts-for-react';
import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { useAppContext } from "../AppContext";
import { graphUtil } from "../graphUtil";
import { getObj } from "../getObj";
import "../App.css";

function EGraph({ sensor_id, start, end, dummy }) {
	/* Graph sensor_id's readings from times start to end.
	 * Author: Keenan
	 * Note: dummy input so Map Buttons can force Graph to rerender when all other inputs are unchanges because the same button is pressed miltuple times to toggle data[where sensor = sensor_id].show  
	 */   	

	//Copy api url from appcontext 
	const {API_URL} = useAppContext();
	const api = axios.create({
          baseURL: API_URL,
	});

	const [loading, setLoading] = useState(false);
	const ref = useRef(null);
	
	const graphStyle = {width: "1500px", height: "300px"};

	//setup data management
	const {dataContext} = useAppContext();
	const [data, setData] = useState([]); //entry format: {"start": start time(in seconds), "data": [], "sensor": 0, "color": color, "show": False}
        //check if data already exists for current sensor
        const checkData = () => {
            console.log(`Checking if data already exists; sensor = ${sensor_id} and context = ${dataContext}`)
            console.log("Result: " + data.some(entry => entry.sensor === sensor_id && entry.context === dataContext));
            return data.some(entry => entry.sensor === sensor_id && entry.context === dataContext);
        };
        //filter for current data context
        const filteredData = () => {
  	    const fd = data.filter(entry => entry.context === dataContext);  
	    return fd;
        };

	//setup nBars slider functionality
	const [nBars, setN] = useState(50); 
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
	const gradConf = {
	      type: 'rect',
	      left: 150,
	      top: 50,
	      z: 0,
	      shape: {
	        width: 1200,
	        height: 180,
	      }
	};
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
		console.log("New gradient: ", gradient);
	}, [start, end]);
 

	//Handle data changes
	useEffect(() => {
		if (lineBool)
			if(checkData()){
				if(sensor_id !== 0)
					setData(prev => prev.map(entry => entry.sensor===sensor_id ? ({...entry, showline:!entry.showline}):(entry)));
				return;
			}
		else
			if(checkData())
				return;
				
		api.get('aqi/time/' + start + "-" + end + '/' + sensor_id)
			.then(response => {
				console.log("Existing Data:", data);
				//console.log("Sensor_id:", sensor_id);
				//console.log("Server's Response", response);
				setData(prev => [...prev, {context: dataContext, sensor:sensor_id, data:response.data.data, color:getObj("C"+sensor_id), showline:lineBool||sensor_id===0}]);
			}).catch(error => {
                    		console.error('Error fetching data:', error);
                    		setLoading(false);
                	});
	}, [sensor_id, start, end, dummy]);

  //Format data series for each line
	const formatLine = (l) => {
		return {
			type: "line",
			name: getObj("$"+l.sensor),
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
    let response = { data: [[1,1]], type: "bar", name: "Empty", itemStyle: {color:"red"} };
    if(selectedData)
	response = formatBars(selectedData, nBars);
    return response;
  };

  //average data into n bars and format bar series
  const formatBars = (b, n) => {
    if(b.data.length === n)
	return b.data

    const step = (end-start)/n;
    let index = 0;
    let cutoff = start + step
    const data = new Array(n);
    let total = 0;
    let count = 0;
    for(let i = 0; i < b.data.length; i++)
    { //average data into n bars
      if(b.data[i][0] >= cutoff){
        data[index] = [cutoff*1000, 0];
	if(count !== 0){
          data[index][1] = Math.round(100*total/count)/100;
        }
	index++;
        cutoff += step;
        total = 0;
        count = 0;
      }
      total += b.data[i][1];
      count++;
    }
    //calculate last bar if bars/n has a remainder
    if(total > 0 && count > 0)
    {
        data[index] = [cutoff * 1000, total / count];	
    }
    //format for echarts
    return {type: "bar", name: getObj("$"+b.sensor), 
      data: data.map(([timestamp, value]) => ({
        value: [timestamp, value],
        itemStyle: { color: colorMap(value) }
      }))
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
 		type: 'value'
    	},
    	tooltip: {
        	trigger: 'axis'
	},
	legend: {
		show: lineBool
	}
    };

if (loading)
	{return (<div className="loading-message">Loading...</div>);}

return (
    <div className="Marginless">
        <h1 className="Marginless">{dataContext} AQI Readings</h1>
        <div className="graphContainer" ref={ref}>
            <button className="Button" onClick={toggleLineBool} style={{width:"30%"}}>
            	{lineBool ? "Switch to Bars View" : "Switch to Line Graph View"}
            </button>
            {lineBool ? (
		<div>
		    <center>*Click a button on the map to toggle displaying it on the line graph</center> 
		    <ReactECharts option={{...graphFormat, ...gradient, series: filteredData().filter(entry => entry.showline).map(formatLine)}}
    				style={graphStyle}
				opts={{renderer:"svg"}}
		    />
		</div>
            ) : (
		<div>
		    <h2>Use slider to set number of bars:</h2>
		    <input
		        type="range"
		        min="7" //1 bar per day
		        max={(end-start)/600} // 1 bar per sample
		        value={nBars}
		        onChange={handleSlider}
		        style={{ width: '100%' }}
		    />
		    <ReactECharts option={{...graphFormat, ...gradient, series: [getBars()]}}
    				style={graphStyle}
				opts={{renderer:"svg"}}
		    />
		</div>
            )}    
	    <center>*The graphs' color gradient shows the time of day with darker hues representing times closer to midnight.</center>
        </div>
    </div>
);

}

export default EGraph;
/*<ReactECharts
  option={{...graphFormat,
    graphic: [{
      type: 'rect',
      left: 0,
      top: 0,
      z: 10,
      shape: {
        width: 200,
        height: 200,
      },
      style: {
        fill: 'red',
      },
    }],
  }}
  style={{ width: 400, height: 300 }}
  opts={{ renderer: 'svg' }}
/>*/