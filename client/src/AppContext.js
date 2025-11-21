import React, { useContext, useState, useMemo, useEffect, useCallback, createContext } from 'react';
import DataCompressor from "./RDPcompression";
import {getObj} from "./getObj";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  console.log("ContextProvider render");
  const [getLine, setLine] = useState(null);
  const [globalLineBool, setGlobalLineBool] = useState(false);
  const [hover, setHover] = useState("");
  const [switches, setSwitches] = useState(new Map());
  const [dataContext, setDataContext] = useState("7-Day");
  const [rawData, setData] = useState([]); //uncompressed data
  const [compressedData, setCompressedData] = useState([]); //...
  const compressor = new DataCompressor(); //data compressor for feeding it to LLM
  const [epsilon, setEpsilon] = useState(0); //epsilon for compressing data
  const [showCompression, setShowCompression] = useState(false); //control whether we wanna display compressed or raw data in graph
  const [showPopup, setPopup] = useState(false);
  const [lineMode, setLineMode] = useState("sensors"); //can be "sensors" or "units"
  const [newLineUnit, setNewLineUnit] = useState(""); //track last unit added to line graph when in unit mode to make API call
  const [sensor_id, setSensor_id] = useState("0");
  const [selectedSensors, setSelectedSensors] = useState({});
  const [buttonPositions, setButtonPositions] = useState({goal:{}, no_overlap:{}});
  const [dashboardConfig, setDashboardConfig] = useState({"plot_type":"echarts", "units":"AQIEPA", "map_type":"satellite", "line_units":[]});
  const [lineUnits, setLineUnits] = useState(dashboardConfig.line_units);
  const [sensor_idAvgs, setSensor_idAvgs] = useState({});
  const [buttonAvgs, setButtonAvgs] = useState({});
  const [showChatBox, setShowChatBox] = useState(false);
  const [BASE_URL, API_URL] = ["https://upton-air.com/","https://upton-air.com/api/data"];
  //const [BASE_URL, API_URL] = ["http://localhost:3000/","http://localhost:5000/api/data"];
  //const [BASE_URL, API_URL] = ["http://localhost:5000/", "https://upton-air.com/api/data"];

  //if only one sensor is selected in lineMode === "sensors", keep that sensor when switching to single select
  const [wasMultiSensor, setWasMultiSensor] = useState(false);
  useEffect(() => {
	if(lineMode === "sensors" && globalLineBool) {setWasMultiSensor(true);}
	else if(wasMultiSensor) {
		const selectedIDs = Object.keys(selectedSensors).filter(k => selectedSensors[k]);
		if(selectedIDs.length === 1)
			setSensor_id(selectedIDs[0]);
		else
			setSensor_id("0");
	}
  }, [lineMode, globalLineBool])

  //filter data
  const selectData = useCallback(() => {
	//console.log("selectData updated... dependencies:", [globalLineBool, rawData, dataContext, lineMode, selectedSensors, lineUnits, sensor_id, dashboardConfig.units]);
	return (globalLineBool ?
		rawData.filter(obj => obj.context === dataContext && (lineMode === "sensors" ? (selectedSensors[obj.sensor] === true && obj.units === dashboardConfig.units) : (lineUnits.includes(obj.units) && obj.sensor === sensor_id)))
		: rawData.filter(obj => (obj.sensor === sensor_id && obj.units === dashboardConfig.units && obj.context === dataContext))	
	);
  }, [globalLineBool, rawData, dataContext, lineMode, selectedSensors, lineUnits, sensor_id, dashboardConfig.units]);

  //track size of filtered data
  const rawDataSize = useCallback(() => {
    return selectData().reduce((sum, entry) => sum + (entry.data?.length ?? 0),0);
  }, [selectData]);


  //get filtered raw/compressed data
  const data = useMemo(() => {
    //console.log("data useMemo Rerender... dependencies:", [selectData, showChatBox, showCompression, compressedData]);
    //compress data if chatBot window is open
    if (showChatBox && showCompression) {//return for graphing if set that way
	return compressedData;
    } else {
	return selectData();
    	//return raw data if not inspecting compression 
    }
  }, [selectData, showChatBox, showCompression, compressedData]);

  //update compressedData
  useEffect(()=> {
	//dont compress if not needed
	if(!showCompression) {
		setCompressedData([]);
		return;}

	//console.log("contextProvider useEffect... dependencies:", [selectData, epsilon]);
	const compressedRes = selectData().map((entry) => ({units: entry.units, sensor: getObj("$"+entry.sensor), data:compressor.get(entry, epsilon)}));
	//console.log("compression result:", compressedRes[0]);
	const totalLength = compressedRes.reduce((sum, entry) => sum + ((entry.data && entry.data.length) || 0),0);

	setCompressedData(compressedRes);
	console.log(`Epsilon: ${epsilon}, CompressedSize: ${totalLength}`);
  }, [showCompression, selectData, epsilon]);

  const contextVals = {
	getLine, setLine,
	globalLineBool, setGlobalLineBool,
	hover, setHover,
	switches, setSwitches,
	dataContext, setDataContext,
	data, setData, rawDataSize,
	BASE_URL,
	API_URL,
	showPopup, setPopup,
	sensor_id, setSensor_id,
	dashboardConfig, setDashboardConfig,
	units: dashboardConfig.units,
	map_type: dashboardConfig.map_type,
	plot_type: dashboardConfig.plot_type,
	lineUnits, setLineUnits, 
	newLineUnit, setNewLineUnit,
	buttonPositions, setButtonPositions,
	button_position: (sensor) => buttonPositions[sensor],
	isLineSelected: (sensor) => !!selectedSensors[sensor],
        toggleLineSelect: (sensor) => {setSelectedSensors((prev) => {const current = !! prev[sensor]; return {...prev, [sensor]: !current};});},
	selectSensor: (sensor) => setSelectedSensors((prev) => ({...prev, [sensor]: true})),
	selectedSensors,
	lineMode, setLineMode,
	compressedData, setCompressedData, 
	compressedSizeFN: (epsilon) => selectData().reduce((sum, entry) => sum + compressor.getCompressedSize(entry, epsilon), 0),
	epsilon, setEpsilon,
	showCompression, setShowCompression,
	sensor_idAvgs, setSensor_idAvgs,
	buttonAvgs, setButtonAvgs,
	showChatBox, setShowChatBox,
  };


  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};

