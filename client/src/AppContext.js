import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

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
  const BASE_URL = "https://upton-air.com/";
  const API_URL = BASE_URL + "api";
  //const API_URL = process.env.API_URL;

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
	sensor_id, setSensor_id
  };


  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};