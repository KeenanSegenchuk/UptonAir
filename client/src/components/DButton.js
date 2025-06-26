import React, {useState, useEffect} from 'react';
import { useAppContext } from "../AppContext";

const DButton = React.memo(({ text, dkey, style }) => {
  //This type of button allows the setting of a global var to key when the button is hovered on so that other components can read that key
  const {switches, setSwitches} = useAppContext();
  const {setHover} = useAppContext();

  //hover functionality
  const mouseIn=()=> {
	console.log("Hovering key: " + dkey);
	setHover(dkey);
  };
  const mouseOut=()=> {
	setHover("");
  };

  //toggle functionality
  useEffect(() => {
    setSwitches(prev => {
      const current = new Map(prev);
      current.set(dkey, false); // Initialize toggle state to false
      return current;
    });
  }, [dkey, setSwitches]);

  const toggle=()=>{
    setSwitches(prev => {
	const current = new Map(prev);
	current.set(dkey, !current.get(dkey));
	return current;
    });
  };

  return (
    <div>
	<button className={switches.get(dkey) ? "pressed" : ""}
      		onMouseEnter={mouseIn} onMouseLeave={mouseOut} onClick={toggle} style={style}>
	    {text}	
	</button>
    </div>
  );
});

export default DButton;
