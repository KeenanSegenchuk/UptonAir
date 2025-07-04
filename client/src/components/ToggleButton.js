import React, { useEffect } from 'react';
import { useAppContext } from "../AppContext";

const ToggleButton = React.memo(({ textOn, textOff, toggleKey, style = {} }) => {
  const { switches, setSwitches } = useAppContext();

  useEffect(() => {
    setSwitches(prev => {
      const current = new Map(prev);
      if (!current.has(toggleKey)) {
        current.set(toggleKey, false); // Initialize toggle state to false if not already set
      }
      return current;
    });
  }, [toggleKey, setSwitches]);

  const toggle = () => {
    setSwitches(prev => {
      const current = new Map(prev);
      current.set(toggleKey, !current.get(toggleKey));
      return current;
    });
  };

  const isOn = switches.get(toggleKey);

  return (
    <div
      onClick={toggle}
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
        style={{
          padding: '8px 16px',
          backgroundColor: !isOn ? '#606060' : '#e0e0e0',
          color: !isOn ? 'white' : 'black',
          fontWeight: !isOn ? 'bold' : 'normal',
          transition: 'background-color 0.2s',
        }}
      >
        {textOff}
      </div>
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: isOn ? '#606060' : '#e0e0e0',
          color: isOn ? 'white' : 'black',
          fontWeight: isOn ? 'bold' : 'normal',
          transition: 'background-color 0.2s',
        }}
      >
        {textOn}
      </div>
    </div>
  );
});

export default ToggleButton;