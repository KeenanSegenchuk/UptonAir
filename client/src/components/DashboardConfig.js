import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";

function DashboardConfig({}) {
    //load cookies to configure map background and data units
    const { dashboardConfig, setDashboardConfig } = useAppContext();
    const [mapType, setMapType] = useState('satellite');
    const [units, setUnits] = useState('AQIEPA');
    const [lineUnits, setLineUnits] = useState([]);
    const [plotType, setPlot] = useState('echarts');
    const [cookieInit, setCookieInit] = useState(false);

    useEffect(() => {
      const savedMapType = Cookies.get('map_type');
      const savedUnits = Cookies.get('units');
      const savedLineUnits = Cookies.get('line_units');
      const savedPlotType = Cookies.get('plot_type');
      console.log("units",savedUnits);
      if (savedMapType) setMapType(savedMapType);
      if (savedUnits) setUnits(savedUnits);
      if (savedLineUnits) setLineUnits(savedLineUnits);
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
    useEffect(() => {
	if(cookieInit)
    	      Cookies.set('line_units', lineUnits);
      setDashboardConfig(prev => ({ ...prev, "line_units":lineUnits }));
      console.log("setting lineUnits", lineUnits);
    }, [lineUnits]);
    useEffect(() => {
	if(cookieInit)
    	      Cookies.set('plot_type', plotType);
      setDashboardConfig(prev => ({ ...prev, "plot_type":plotType }));
      console.log("setting plot type", plotType);
    }, [plotType]);

    return (
	    <div id="DashboardConfig.js" class="optionsdiv">
	        <h2>Dashboard Config</h2>
		<label class="s16">
		    Select Map Type:<br/>
		    <select class="s9" value={mapType} onChange={e => setMapType(e.target.value)}>
                        <option value="satellite">Satellite</option>
                        <option value="roads">Roads</option>
                        {/* maybe add back later <option value="img">Image</option>*/}
                    </select>
		</label>
		<label class="s16">
		    Select Map/Bar Graph Units:<br/>
		    <select class="s9" value={units} onChange={e => setUnits(e.target.value)}>
       		        {Object.keys(getObj("u")).map((val, index) => (
				<option value={val}>{getObj("W" + val)}</option>
			))}
		    </select>
		</label>
		{/* select boxes for graphing multiple readings from the same sensor <label class="s16">
		    Select Line Graph Units:<br/>
		    <div class="checkbox-group">
		        {[
		            "AQIEPA", "AQI", "PMEPA", "PM", "PMA", "PMB", "humidity", "percent_difference"
		        ].map(unit => (
		            <label key={unit} class="s9" style={{ display: "block" }}>
		                <input
		                    type="checkbox"
		                    value={unit}
		                    checked={lineUnits.includes(unit)}
		                    onChange={(e) => {
		                        const value = e.target.value;
		                        setLineUnits(prev =>
		                            e.target.checked
		                                ? [...prev, value]
		                                : prev.filter(item => item !== value)
		                        );
		                    }}
		                />
		                {unit}
		            </label>
		        ))}
		    </div>
		</label> */}
		{/* maybe give chart option later
		<label class="s16">
		    !WIP! Select Plot Framework:<br/>
		    <select class="s9" value={plotType} onChange={e => setPlot(e.target.value)}>
       		        <option value="echarts">ECharts (default)</option>
      		        <option value="plotly">Plotly</option>
      		    </select>
		</label> */}
	    </div>
    );
}

export default DashboardConfig;