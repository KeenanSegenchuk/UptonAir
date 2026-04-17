import React, { useContext, useState, useMemo, useEffect, useCallback, createContext } from 'react';
import DataCompressor from "./RDPcompression";
import {getObj} from "./getObj";
import config from './config.json';
import { useSensorData } from './hooks/useSensorData';
import { useGraphConfig } from './hooks/useGraphConfig';
import { useChatState } from './hooks/useChatState';

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  console.log("ContextProvider render");

  const graphConfig = useGraphConfig();
  const sensorData = useSensorData({ initialLineUnits: graphConfig.dashboardConfig.line_units });
  const chatState = useChatState();

  const { protocol, host, hostname } = window.location;
  const BASE_URL = protocol + "//" + host + "/";

  //vvvvv USING LOCAL SERVER vvvvv
  //const API_URL = "//" + hostname + ":5000" + "/api/";
  //vvvvv USING WEB SERVER vvvvv
  const API_URL = "https://" + config.URL + "/api/";

  // Apply dark mode on mount
  useEffect(() => {
    document.body.classList.toggle('dark-mode', chatState.darkMode);
  }, []);

  // CSRF token — fetched once and provided to all alert API calls
  const [csrfToken, setCsrfToken] = useState('');
  useEffect(() => {
    fetch(API_URL + 'csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrf_token))
      .catch(err => console.error('Failed to fetch CSRF token:', err));
  }, []);

  const compressor = new DataCompressor();

  //if only one sensor is selected in lineMode === "sensors", keep that sensor when switching to single select
  //otherwise sensor_id will default to last clicked sensor, even if the click unselected that sensor
  const [wasMultiSensor, setWasMultiSensor] = useState(false);
  useEffect(() => {
    if(sensorData.lineMode === "sensors" && graphConfig.globalLineBool) {setWasMultiSensor(true);}
    else if(wasMultiSensor && sensorData.lineMode === "sensors") {
      const selectedIDs = Object.keys(sensorData.selectedSensors).filter(k => sensorData.selectedSensors[k]);
      if(selectedIDs.length === 1)
        sensorData.setSensor_id(selectedIDs[0]);
    }
  }, [sensorData.lineMode, graphConfig.globalLineBool]);

  //filter data
  const selectData = useCallback(() => {
    //console.log("selectData updated... dependencies:", [globalLineBool, rawData, dataContext, lineMode, selectedSensors, lineUnits, sensor_id, dashboardConfig.units]);
    return (graphConfig.globalLineBool ?
      sensorData.rawData.filter(obj => obj.context === graphConfig.dataContext && (sensorData.lineMode === "sensors" ? (sensorData.selectedSensors[obj.sensor] === true && obj.units === graphConfig.dashboardConfig.units) : (sensorData.lineUnits.includes(obj.units) && obj.sensor === sensorData.sensor_id)))
      : sensorData.rawData.filter(obj => (obj.sensor === sensorData.sensor_id && obj.units === graphConfig.dashboardConfig.units && obj.context === graphConfig.dataContext))
    );
  }, [graphConfig.globalLineBool, sensorData.rawData, graphConfig.dataContext, sensorData.lineMode, sensorData.selectedSensors, sensorData.lineUnits, sensorData.sensor_id, graphConfig.dashboardConfig.units]);

  //track size of filtered data
  const rawDataSize = useCallback(() => {
    return selectData().reduce((sum, entry) => sum + (entry.data?.length ?? 0), 0);
  }, [selectData]);

  //get filtered raw/compressed data
  const data = useMemo(() => {
    //console.log("data useMemo Rerender... dependencies:", [selectData, showChatBox, showCompression, compressedData]);
    //compress data if chatBot window is open
    if (chatState.showChatBox && sensorData.showCompression) { //return for graphing if set that way
      return sensorData.compressedData;
    } else {
      return selectData();
      //return raw data if not inspecting compression
    }
  }, [selectData, chatState.showChatBox, sensorData.showCompression, sensorData.compressedData]);

  //update compressedData
  useEffect(() => {
    //dont compress if not needed
    if(!sensorData.showCompression) {
      sensorData.setCompressedData([]);
      return;
    }

    //console.log("contextProvider useEffect... dependencies:", [selectData, epsilon]);
    const compressedRes = selectData().map((entry) => ({units: entry.units, sensor: getObj("$"+entry.sensor), data:compressor.get(entry, sensorData.epsilon)}));
    //console.log("compression result:", compressedRes[0]);
    const totalLength = compressedRes.reduce((sum, entry) => sum + ((entry.data && entry.data.length) || 0), 0);

    sensorData.setCompressedData(compressedRes);
    console.log(`Epsilon: ${sensorData.epsilon}, CompressedSize: ${totalLength}`);
  }, [sensorData.showCompression, selectData, sensorData.epsilon]);

  const contextVals = {
    // graphConfig
    getLine: graphConfig.getLine, setLine: graphConfig.setLine,
    globalLineBool: graphConfig.globalLineBool, setGlobalLineBool: graphConfig.setGlobalLineBool,
    hover: graphConfig.hover, setHover: graphConfig.setHover,
    switches: graphConfig.switches, setSwitches: graphConfig.setSwitches,
    dataContext: graphConfig.dataContext, setDataContext: graphConfig.setDataContext,
    dashboardConfig: graphConfig.dashboardConfig, setDashboardConfig: graphConfig.setDashboardConfig,
    units: graphConfig.dashboardConfig.units,
    map_type: graphConfig.dashboardConfig.map_type,
    plot_type: graphConfig.dashboardConfig.plot_type,
    buttonPositions: graphConfig.buttonPositions, setButtonPositions: graphConfig.setButtonPositions,
    button_position: (sensor) => graphConfig.buttonPositions[sensor],

    // sensorData
    data, setData: sensorData.setData, rawDataSize,
    rawData: sensorData.rawData,
    compressedData: sensorData.compressedData, setCompressedData: sensorData.setCompressedData,
    compressedSizeFN: (epsilon) => selectData().reduce((sum, entry) => sum + compressor.getCompressedSize(entry, epsilon), 0),
    epsilon: sensorData.epsilon, setEpsilon: sensorData.setEpsilon,
    showCompression: sensorData.showCompression, setShowCompression: sensorData.setShowCompression,
    sensor_id: sensorData.sensor_id, setSensor_id: sensorData.setSensor_id,
    selectedSensors: sensorData.selectedSensors, setSelectedSensors: sensorData.setSelectedSensors,
    lineMode: sensorData.lineMode, setLineMode: sensorData.setLineMode,
    newLineUnit: sensorData.newLineUnit, setNewLineUnit: sensorData.setNewLineUnit,
    lineUnits: sensorData.lineUnits, setLineUnits: sensorData.setLineUnits,
    sensor_idAvgs: sensorData.sensor_idAvgs, setSensor_idAvgs: sensorData.setSensor_idAvgs,
    buttonAvgs: sensorData.buttonAvgs, setButtonAvgs: sensorData.setButtonAvgs,
    isLineSelected: sensorData.isLineSelected,
    toggleLineSelect: sensorData.toggleLineSelect,
    selectSensor: sensorData.selectSensor,

    // chatState
    showChatBox: chatState.showChatBox, setShowChatBox: chatState.setShowChatBox,
    showPopup: chatState.showPopup, setPopup: chatState.setPopup,
    darkMode: chatState.darkMode, toggleDarkMode: chatState.toggleDarkMode,
    csrfToken,

    // URLs
    BASE_URL,
    API_URL,
  };

  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};
