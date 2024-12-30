import React, {useState} from "react";
function Bar({ val, max }) {
    const [isHovered, setIsHovered] = useState(false);
    const colors = ["green", "yellow", "orange", "red", "black"];
    const ranges = [25, 50, 100, 300];
    const height = (100*val)/max;
    const tmargin = 100 - height;
    var index = 4;

    ranges.forEach((v, i) => {/*console.log(val);*/ if(index == 4 && val<v){index = i;}});

    const style = {backgroundColor: colors[index],
		   width: "100%",
		   height: height.toString() + "%",
		   cursor: "pointer"
		   };

    return (
	<div style={style} title={val}/>
    );
}

export default Bar;