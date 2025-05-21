import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  const [getLine, setLine] = useState(null);
  const [globalLineBool, setGlobalLineBool] = useState(false);
  const [hover, setHover] = useState("");
  const [switches, setSwitches] = useState(new Map());
  const [dataContext, setDataContext] = useState("7 days");
  const API_URL = "http://raspberrypi.local/";

  const contextVals = {
	getLine, setLine,
	globalLineBool, setGlobalLineBool,
	hover, setHover,
	switches, setSwitches,
	dataContext, setDataContext,
	API_URL
  };


  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};