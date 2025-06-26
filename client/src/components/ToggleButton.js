import React, {useState, useEffect} from 'react';
import { useAppContext } from "../AppContext";

const ToggleButton = React.memo(({ textOn, textOff, toggleKey, style }) => {
  //This dual button allows for setting hashmap values and hover keys
  const {switches, setSwitches} = useAppContext();
  
  useEffect(() => {
    setSwitches(prev => {
      const current = new Map(prev);
      current.set(toggleKey, false); // Initialize toggle state to false
      return current;
    });
  }, [toggleKey, setSwitches]);
  
  const toggle=()=>{
    setSwitches(prev => {
	const current = new Map(prev);
	current.set(toggleKey, !current.get(toggleKey));
	return current;
    });
  };


  return (
    <div>
	<button onClick={toggle} style={style}>
	    {switches.get(toggleKey) ? textOn : textOff}
	</button>
    </div>
  );
});

export default ToggleButton;
