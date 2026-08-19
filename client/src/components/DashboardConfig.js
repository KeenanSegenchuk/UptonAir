import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useAppContext } from "../AppContext";
import ChatBox from "./ChatBox";
import MoveableWindow from "./MoveableWindow";

function DashboardConfig() {
    //this element can be used to configure the dashboard page, changing the map, data layer, etc.

    //load cookies to configure map background and data units
    const { showConfig, setShowConfig, setDashboardConfig, lineUnits, setLineUnits, setNewLineUnit, isLineSelected, toggleLineSelect, lineMode, setLineMode, globalLineBool, setGlobalLineBool, sensor_id, setSensor_id, showChatBox, setShowChatBox, darkMode, toggleDarkMode } = useAppContext();
    const [showRoads, setShowRoads] = useState(false);
    const [units, setUnits] = useState('AQIEPA');
    const [plotType, setPlot] = useState('echarts');
    const [cookieInit, setCookieInit] = useState(false);

    // control config popup visibility (AppContext owns this now.)
    //const [showConfig, setShowConfig] = useState(false);

    //track width to adjust how long data type labels are
    const [width, setWidth] = useState(0);
    useEffect(() => {
      const el = document.getElementById("DashboardConfig.js");
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    //force line graph mode to reduce complexity on mobile
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if(isMobile) {setGlobalLineBool(true);}

    const { getObj } = require("../getObj");
    const sensors = getObj("sensors");
    const unitColors = getObj("uc");

    //check for values saved in cookies
    useEffect(() => {
      const savedShowRoads = Cookies.get('show_roads');
      const savedUnits = Cookies.get('units');
      //const savedLineUnits = Cookies.get('line_units');

      //init lineUnits to only having default unit (savedUnits) selected
      setLineUnits([savedUnits]);

      const savedPlotType = Cookies.get('plot_type');
      console.log("units",savedUnits);
      if (savedShowRoads) setShowRoads(savedShowRoads === "true");
      if (savedUnits) setUnits(savedUnits);
      //if (savedLineUnits) setLineUnits(savedLineUnits);
      if (savedPlotType) setPlot(savedPlotType);
      setCookieInit(true);
    }, []);

    //update cookies when selected
    useEffect(() => {
	if(cookieInit)
	      Cookies.set('show_roads', showRoads);
      setDashboardConfig(prev => ({ ...prev, "show_roads":showRoads }));
    }, [showRoads]);
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
	    <>
	    {/* Gear icon: opens/closes the config popup */}
	    <div
	      style={{
	        position: 'absolute',
	        top: 10,
	        right: 10,
	        zIndex: 1000
	      }}
	    >
	      <button
	        onClick={() => setShowConfig(prev => !prev)}
	        style={{
	          background: 'transparent',
	          borderRadius: '50%',
	          fontSize: '40px',
	          border: 'none',
	          cursor: 'pointer'
	        }}
	        title="Settings"
	      >
	        ⚙️
	      </button>
	    </div>
	
	    {/* Roads toggle: overlays road/label tiles on top of the satellite basemap */}
	    <div
	      style={{
	        position: 'absolute',
	        top: 75,
	        right: 10,
	        zIndex: 1000
	      }}
	    >
	      <button
	        onClick={() => setShowRoads(prev => !prev)}
	        style={{
	          background: showRoads ? 'rgba(80,200,120,0.6)' : 'rgba(255,255,255,0.6)',
	          borderRadius: '6px',
	          fontSize: '14px',
	          border: 'none',
	          padding: '6px 10px',
	          cursor: 'pointer'
	        }}
	        title="Toggle Roads Overlay"
	      >
	        {showRoads ? "Hide Roads" : "Show Roads"}
	      </button>
	    </div>

	    {/* Config Modal Overlay */}
	    <div style={{display: showConfig ? "block":"none"}}>
	      <div
	        style={{
	          position: "absolute",
	          top: 0,
	          left: 0,
	          width: "100%",
	          height: "100%",
	          backgroundColor: "rgba(0,0,0,0.4)",
	          zIndex: 1499,
	        }}
	        onClick={() => setShowConfig(false)}
	      >
	        <div
	          style={{
	            position: "absolute",
	            maxHeight: "90%",
	            top: "5%",
	            left: "50%",
	            transform: "translate(-50%)",
	            width: "75%",
	            backgroundColor: "rgba(240,255,240,0.95)",
	            zIndex: 1500,
	            padding: "20px",
	            overflow: "auto",
	            borderRadius: "10px",
	            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
	          }}
	          onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
	        >
	          <button
	            onClick={() => setShowConfig(false)}
	            style={{
	              position: "absolute",
	              top: 10,
	              right: 10,
	              background: "transparent",
	              border: "none",
	              fontSize: "24px",
	              cursor: "pointer",
	            }}
	            title="Close"
	          >
	            ✕
	          </button>
	    <div tutorial-label="Options" id="DashboardConfig.js" className="optionsdiv">
	        <h2>Dashboard Config</h2>

		{true &&
			<label tutorial-label="Units" className="s16">
			    Measurement/Units:<br/>
			    <select className="s9" value={units} style={{maxWidth:"90%"}} onChange={e => setUnits(e.target.value)}>
	       		        {Object.keys(getObj("u")).map((val, index) => (
					<option value={val}>{getObj("W" + val)}</option>
				))}
			    </select>
			</label>
		}

		<label className="s16">
		    Graph Style:<br/>
		    <select className="s9"  value={globalLineBool ? "line" : "bar"} onChange={e => setGlobalLineBool(e.target.value === "line")}>
                        <option value="bar">Bar Graph</option>
                        <option value="line">Line Graph</option>
                    </select>
		</label>

		{/* single-select sensor */}
		{!(globalLineBool && lineMode==="sensors") && (
		    <>	
			<label className="s16">
			  Select Sensor:<br />
			  <select
			    className="s9"
			    value={sensor_id}
			    onChange={(e) => {setSensor_id(e.target.value)}}
			  >
			      {getObj("s").map(id => (
			          <option key={id} value={id}>{getObj("$" + id)}</option>
			      ))}
			  </select>
			</label>
		    </>
		)}

		{/*Line Mode Options*/}
		{globalLineBool && (
		    <>
			{/* toggle between units and sensors */}	
			<label className="s16">
			  Line Graph Mode:<br />
			  <select
			    className="s9"
			    value={lineMode}
			    onChange={(e) => {setLineMode(e.target.value); if(e.target.value === "units" && !lineUnits.includes(units)) {setLineUnits(prev => [...prev, units]);}}}
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

		<div style={{"display":"flex", "paddingTop":"15px"}}>
			<span style={{"fontSize":"30px"}}>🤖</span>
			<button
			style={{"fontSize": "20px", "padding": "2% 2%", "width":"100%"}}
			onClick={()=>setShowChatBox(prev=>!prev)}>{showChatBox ? "Close Chat Bot" : "Open Chat Bot"}</button>
			<span style={{"fontSize":"30px"}}>🤖</span>
		</div>

		<button
		  style={{"fontSize": "16px", "padding": "8px", "width":"100%", "marginTop":"8px"}}
		  onClick={toggleDarkMode}
		>{darkMode ? "Light Mode" : "Dark Mode"}</button>

		{showChatBox && (
		    <MoveableWindow title="Chat Bot" onClose={()=>setShowChatBox(false)} initial={{ x: 200, y: 100, width: 800, height: 600 }}>
			<ChatBox/>
		    </MoveableWindow>
		    /*<ChatBox/>*/
		)}
	    </div>
	  </div>
	</div>
      </div>
    </>
    );
}

export default DashboardConfig;