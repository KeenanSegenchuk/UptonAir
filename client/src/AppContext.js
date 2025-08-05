import React, { useContext, useState, createContext } from 'react';

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  const [getLine, setLine] = useState(null);
  const [globalLineBool, setGlobalLineBool] = useState(false);
  const [hover, setHover] = useState("");
  const [switches, setSwitches] = useState(new Map());
  const [dataContext, setDataContext] = useState("7-Day");
  const [data, setData] = useState([]);
  const [showPopup, setPopup] = useState(false);
  const [sensor_id, setSensor_id] = useState("0");
  const [dashboardConfig, setDashboardConfig] = useState({"plot_type":"echarts", "units":"AQIEPA", "map_type":"satellite"});
  const [BASE_URL, API_URL] = ["https://upton-air.com/","https://upton-air.com/api/data"];
  //const [BASE_URL, API_URL] = ["http://localhost:3000/","http://localhost:5000/api/data"];

  const contextVals = {
	getLine, setLine,
	globalLineBool, setGlobalLineBool,
	hover, setHover,
	switches, setSwitches,
	dataContext, setDataContext,
	data, setData,
	BASE_URL,
	API_URL,
	showPopup, setPopup,
	sensor_id, setSensor_id,
	dashboardConfig, setDashboardConfig,
	units: dashboardConfig.units,
	map_type: dashboardConfig.map_type,
	plot_type: dashboardConfig.plot_type,
	lineUnits: dashboardConfig.line_units,
  };


  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};

