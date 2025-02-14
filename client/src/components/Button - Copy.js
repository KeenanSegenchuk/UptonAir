import React, {useState} from 'react';

const HoverButton = ({ text, key }) => {
  //This type of button allows the setting of a global var to key when the button is hovered on so that other components can read that key
  const {setHover} = useAppContext();
  const mouseIn()=> {
	setHover(key);
  };
  const mouseOut()=> {
	setHover("");
  };

  return (
    <div>
	<Button onmouseover="mouseIn()" onmouseout="mouseOut()">
	{text}	
	</Button>
    </div>
  );
};

export default InfoBox;
