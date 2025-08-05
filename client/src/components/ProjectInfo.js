import React from 'react';
import * from InfoBox;

const ProjectInfo = ({ file }) => {

  const generateStyleObject = (
    backgroundColor = 'transparent',  // Default to transparent
    height = 'auto',                   // Default to auto height
    borderColor = 'black',             // Default to black border
    borderWidth = '1px',               // Default to 1px border width
    textColor = 'black',               // Default to black text color
    textFont = 'Arial',                // Default to Arial font
    textSize = '16px'                  // Default to 16px text size
  ) => {
  return {
    backgroundColor,
    height,
    borderColor,
    borderWidth,
    color: textColor,  // text-color
    fontFamily: textFont,  // text-font
    fontSize: textSize  // text-size
  };
  };

  return (
    <div id="ProjectInfo.js">
    </div>
  );
};

export default ProjectInfo;
