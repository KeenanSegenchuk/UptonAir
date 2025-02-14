import React, {useState} from 'react';
import { useAppContext } from "../AppContext";

const HoverButton = React.memo(({ text, hoverKey, style }) => {
  //This type of button allows the setting of a global var to key when the button is hovered on so that other components can read that key
  const {setHover} = useAppContext();
  const mouseIn=()=> {
	console.log("Hovering key: " + hoverKey);
	setHover(hoverKey);
  };
  const mouseOut=()=> {
	setHover("");
  };

  return (
    <div >
	<button onMouseEnter={mouseIn} onMouseLeave={mouseOut} style={style}>
	{text}	
	</button>
    </div>
  );
});

export default HoverButton;
