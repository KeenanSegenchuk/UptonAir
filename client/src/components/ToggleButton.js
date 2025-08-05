import React, { useEffect } from 'react';
import { useAppContext } from "../AppContext";

const ToggleButton = React.memo(({ textOn, textOff, toggleKey, style = {} }) => {
  const { switches, setSwitches, setHover } = useAppContext();

  useEffect(() => {
    setSwitches(prev => {
      const current = new Map(prev);
      if (!current.has(toggleKey)) {
        current.set(toggleKey, false); // Initialize toggle state to false if not already set
      }
      return current;
    });
  }, [toggleKey, setSwitches]);

  const toggle = (key) => {
    console.log("Switching key:", key);
    setSwitches(prev => {
      console.log("Setting to:", !prev);
      const current = new Map(prev);
      current.set(key, !current.get(key));
      return current;
    });
  };
  
  const isOn = switches.get(toggleKey);


  //you can use a pipe character to show different text when one side of the toggle is selected
  //check for different text on toggle
  const partsOn = textOn.split('|').map(p => p.trim());
  const partsOff = textOff.split('|').map(p => p.trim());

  const txtOff = partsOff.length === 1 ? partsOff[0] : (isOn ? partsOff[1] : partsOff[0]);
  const txtOn  = partsOn.length === 1  ? partsOn[0]  : (isOn ? partsOn[1]  : partsOn[0]);
  const clickOff = partsOff.length === 1 ? () => toggle(toggleKey) : () => setHover(partsOff[1]);
  const clickOn = partsOn.length === 1 ? () => toggle(toggleKey) : () => setHover(partsOn[1]);

  return (
    <div
      id="Togglebutton.js"
      style={{
        display: 'inline-flex',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #ccc',
        cursor: 'pointer',
        userSelect: 'none',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      <div
        onClick={!switches.get(toggleKey) ? clickOff : () => toggle(toggleKey)}
	className = { `${!isOn ? "toggleOn":"toggleOff"}
		       ${!isOn && partsOff.length === 2 ? 'toggleOnClickable' : ''}` }
        style={{
          padding: '8px 16px',
          transition: 'background-color 0.2s',
        }}
      >
        {txtOff}
      </div>
      <div
        onClick={switches.get(toggleKey) ? clickOn : () => toggle(toggleKey)}
	className = { `${isOn ? "toggleOn":"toggleOff"}
		       ${isOn && partsOn.length === 2 ? 'toggleOnClickable' : ''}` }
        style={{
          padding: '8px 16px',
          transition: 'background-color 0.2s',
        }}
      >
        {txtOn}
      </div>
    </div>
  );
});

export default ToggleButton;