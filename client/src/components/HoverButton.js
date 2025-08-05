import React from 'react';
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
    <div id = "HoverButton.js" style={{display:"flex", justifyContent: "center", aligItems:"center", top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
	<button onMouseEnter={mouseIn} onMouseLeave={mouseOut} style={style}>
	{text}	
	</button>
    </div>
  );
});

export default HoverButton;
