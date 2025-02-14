import React, {useState, useEffect} from 'react';
import { useAppContext } from "../AppContext";

const ToggleButton = React.memo(({ text, toggleKey, style }) => {
  //This type of button allows the setting of a global var to key when the button is hovered on so that other components can read that key
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
	{text}	
	</button>
    </div>
  );
});

export default ToggleButton;
