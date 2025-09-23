import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useAppContext } from "../AppContext";

function DashboardConfig() {
    //this element can be used to configure the dashboard page, changing the map, data layer, etc.

    //load cookies to configure map background and data units
    const { setDashboardConfig, lineUnits, setLineUnits, setNewLineUnit, isLineSelected, toggleLineSelect, lineMode, setLineMode, globalLineBool, setGlobalLineBool, setSensor_id } = useAppContext();
    const [mapType, setMapType] = useState('satellite');
    const [units, setUnits] = useState('AQIEPA');
    const [plotType, setPlot] = useState('echarts');
    const [cookieInit, setCookieInit] = useState(false);

    //track width to adjust how long data type labels are
    const [width, setWidth] = useState(0);
    useEffect(() => {
      const el = document.getElementById("DashboardConfig.js");
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);


    const { getObj } = require("../getObj");
    const sensors = getObj("sensors");
    const unitColors = getObj("uc");

    //check for values saved in cookies
    useEffect(() => {
      const savedMapType = Cookies.get('map_type');
      const savedUnits = Cookies.get('units');
      //const savedLineUnits = Cookies.get('line_units');

      //init lineUnits to only having default unit (savedUnits) selected
      setLineUnits([savedUnits]);

      const savedPlotType = Cookies.get('plot_type');
      console.log("units",savedUnits);
      if (savedMapType) setMapType(savedMapType);
      if (savedUnits) setUnits(savedUnits);
      //if (savedLineUnits) setLineUnits(savedLineUnits);
      if (savedPlotType) setPlot(savedPlotType);
      setCookieInit(true);
    }, []);

    //update cookies when selected
    useEffect(() => {
	if(cookieInit)
	      Cookies.set('map_type', mapType);
      setDashboardConfig(prev => ({ ...prev, "map_type":mapType }));
    }, [mapType]);
    useEffect(() => {
	if(cookieInit)
    	      Cookies.set('units', units);
      setDashboardConfig(prev => ({ ...prev, "units":units }));
      console.log("setting units", units);
    }, [units]);
    /*don't use cookies for this it might be too confusing for the user... useEffect(() => {
	if(cookieInit)
    	      Cookies.set('line_units', JSON.stringify(lineUnits));
      setDashboardConfig(prev => ({ ...prev, "line_units":lineUnits }));
      console.log("setting lineUnits", lineUnits);
    }, [lineUnits]);*/
    useEffect(() => {
	if(cookieInit)
    	      Cookies.set('plot_type', plotType);
      setDashboardConfig(prev => ({ ...prev, "plot_type":plotType }));
      console.log("setting plot type", plotType);
    }, [plotType]);

    return (
	    <div id="DashboardConfig.js" className="optionsdiv">
	        <h2>Dashboard Config</h2>
		<label className="s16">
		    Map Background:<br/>
		    <select className="s9" value={mapType} onChange={e => setMapType(e.target.value)}>
                        <option value="satellite">Satellite</option>
                        <option value="roads">Roads</option>
                        {/* maybe add back later <option value="img">Image</option>*/}
                    </select>
		</label>
	
		{true /*lineMode != "units"*/ &&
			<label className="s16">
			    Main Map/Graph Units:<br/>
			    <select className="s9" value={units} style={{maxWidth:"90%"}} onChange={e => setUnits(e.target.value)}>
	       		        {Object.keys(getObj("u")).map((val, index) => (
					<option value={val}>{getObj("W" + val)}</option>
				))}
			    </select>
			</label>
		}

		<label className="s16">
		    Graph Style:<br/>
		    <select className="s9" value={globalLineBool ? "line" : "bar"} onChange={e => setGlobalLineBool(e.target.value === "line")}>
                        <option value="bar">Bar Graph</option>
                        <option value="line">Line Graph</option>
                        {/* maybe add back later <option value="img">Image</option>*/}
                    </select>
		</label>

		{globalLineBool && (
		    <>
			{/* toggle between units and sensors */}	
			<label className="s16">
			  Line Graph Mode:<br />
			  <select
			    className="s9"
			    value={lineMode}
			    onChange={(e) => setLineMode(e.target.value)}
			  >
			    <option value="units">Units</option>
			    <option value="sensors">Sensors</option>
			  </select>
			</label>
	
			{/* select boxes for graphing multiple readings from the same sensor  */}
			{lineMode == "units" ?
			<label className="s16">
			    Line Graph Units:<br/>
			    <div className="checkbox-group">
			        {/*[
			            "AQIEPA", "AQI", "PMEPA", "PM", "PMA", "PMB", "humidity", "percent_difference"
			        ]*/
				Object.keys(getObj("u")).map(unit => (
			            <label key={unit} className="s9" style={{ display: "block", whiteSpace: "nowrap" }}>
			                <input
			                    type="checkbox"
			                    value={unit}
			                    checked={lineUnits.includes(unit)}
					    style={{accentColor: unitColors[unit]}}
			                    onChange={(e) => {
						if (e.target.value.length === 1)
			                        	return;
						const value = e.target.value;
						setNewLineUnit(e.target.value);
			                        setLineUnits(prev =>
			                            e.target.checked
			                                ? [...prev, value]
			                                : prev.filter(item => item !== value)
			                        );
			                    }}
			                />
			                {width > 268 ? getObj("W" + unit) : unit}
			            </label>
			        ))}
			    </div>
			</label> 
			: 
			<div id="sensorSelect" className="s16">
			  Line Graph Sensors:<br />
			  <div className="checkbox-group">
			    {sensors.map((sensor) => (
			      <label key={sensor} className="s9" style={{ display: "block" }}>
			        <input
			          type="checkbox"
			          value={sensor}
			          checked={isLineSelected(sensor)} // ✅ default false if not set
			          onChange={() => {if(!isLineSelected(sensor)){setSensor_id(sensor);} toggleLineSelect(sensor);}} // ✅ flip on click
			        />
			        {getObj(`$${sensor}`)} {/* label */}
			      </label>
			    ))}
			  </div>
			</div>
			}
		    </>
		)}


		{/* maybe give chart library options later
		<label className="s16">
		    !WIP! Select Plot Framework:<br/>
		    <select className="s9" value={plotType} onChange={e => setPlot(e.target.value)}>
       		        <option value="echarts">ECharts (default)</option>
      		        <option value="plotly">Plotly</option>
      		    </select>
		</label> */}
	    </div>
    );
}

export default DashboardConfig;