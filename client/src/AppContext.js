import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  const [getLine, setLine] = useState(null);
  const [globalLineBool, setGlobalLineBool] = useState(false);

  const contextVals = {
	getLine, setLine,
	globalLineBool, setGlobalLineBool
  };


  return (
    <AppContext.Provider value={contextVals}>
      {children}
    </AppContext.Provider>
  );
};