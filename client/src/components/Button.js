import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";
import "../App.css";

function Button({ id, x, y }) {    
    //build api route
    const {API_URL} = useAppContext();
    const api = axios.create({
      baseURL: API_URL,
    });
    //check if mobile to let buttons enable sensorinfo popup
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    //setup vars and static vals
    const [val, setVal] = useState(-1);
    const ranges = getObj("r");
    const colors = getObj("c");
    const [color, setColor] = useState("default");
    const name = getObj("$" + id);
    const borderColor = getObj("C" + id);
    const labelOffsets = getObj("O" + id);
    const { globalLineBool, hover, switches, data, setData, setPopup } = useAppContext();
    const [borderStyle, setBorderStyle] = useState("none");
    const hoverKey = "labels";

    //times
    const [end] = useState(() => Math.floor(Date.now() / 1000));

    //track selected data range
    const {dataContext, setSensor_id, sensor_id} = useAppContext();
    const [contexts] = useState(() => getObj("DataContexts"));
    const [selected, setSelected] = useState(false);

    //----Data update handling----//

    //check if data already exists for current sensor
    const checkData = () => {
        //console.log(`Checking if data already exists; sensor = ${sensor_id} and context = ${dataContext}`)
        //console.log("Result: " + data.some(entry => entry.sensor === id && entry.context === dataContext));
        return data.some(entry => entry.sensor === id && entry.context === dataContext);
    };

    //Load sensor avg on mount for desktop
    useEffect(() => {
	console.log("Mounting with global sensor: ", sensor_id); 
	if(id === sensor_id) {
		console.log("Loading default sensor on mount.");
		getData();
	}
    }, []);



    //pull data from API when clicked
    const getData = (forceSelect) => {
	if(!globalLineBool && !switches.get("selected"))
		setSensor_id(id);
	if(checkData())
		return;

	const start = end - contexts[dataContext];
	api.get('aqi/time/' + start + "-" + end + '/' + id)
		.then(response => {
			//console.log("Existing Data:", data);
			//console.log("Sensor_id:", id);
			//console.log("Server's Response", response);
			if(!checkData())
				setData(prev => {if(prev.some(entry => entry.sensor === id && entry.context === dataContext))
							return prev;
						return [...prev, {context: dataContext, sensor:id, data:response.data.data, color:getObj("C"+id), showline: forceSelect === undefined ? selected : forceSelect}];
					});

		}).catch(error => {
        		console.error('Error fetching data:', error);
               	});

    };


    //sync line graph selection with border
    const syncLine = () => {
      setData(prev =>
        prev.map(item =>
          item.sensor === id
           ? { ...item, showline: selected }
           : item
        )
      );
    };
    const syncBorder = () => {
	if(selected)
		setBorderStyle(`0 0 0 5px ${borderColor}`);
	else
		setBorderStyle("none");
    };
    

    //check for id == sensor_id during swap to globallinebool and update showline for that data series
    useEffect(() => {
	if(id === sensor_id && globalLineBool)
	{
		setSelected(true);
	}
    }, [globalLineBool]);

    //fetch updated data when context changes
    const [seenContexts, setSeenContexts] = useState(new Set());
    useEffect(() => {
	if(id === sensor_id && !seenContexts.has(dataContext)) {
		getData();
		setSeenContexts(prev => prev.add(dataContext));
	}else if(globalLineBool && selected) {
		getData();
		setSeenContexts(prev => prev.add(dataContext));
	}
    }, [dataContext]);

    //----Setup Button Element----//
    useEffect(() => {
        api.get('aqi/avg/'+(end-60*60+"-"+end+"/"+id))
            .then(response => {
                //console.log("/aqi/avg API Response:",response);
		if(!response.data)
			{console.log("Error getting button value."); 
			return;}
		setVal(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // Calculate the color based on val
    useEffect(() => {
	//console.log(val);
	for (let i = 0; i < ranges.length; i++) {
	    if (val < ranges[i]) {
                setColor(colors[i]);
                break;
            }
        }
    }, [val]);

    const handleButtonClick = (sensorValue, event) => {
        if (globalLineBool || switches.get("select")) {
	    if(!switches.get("select")) {
	        setSensor_id(id);
	        if(isMobile) {
		    setPopup(true);
	        }
	    }
	    if(selected){//if currently selected deselect and get data
		if(!isMobile || switches.get("select")) {
		        setSelected(false);
			getData(false);
		}
	    }else{
		setSelected(true);
		getData(true);
	    }
	    return;
        }
	console.log(sensorValue);
	setSensor_id(id);
	if(isMobile) {
	    setPopup(true);
	}
        event.preventDefault(); 
        //check if new data needs to be pulled
	getData();
    };

    const labelStyle = {
      position: "absolute",
      fontSize: '14px', // small text
      fontWeight: 'bold', // bold text
      backgroundColor: '#f4e1a1', // manila color (a soft yellow)
      padding: '0', // no padding
      margin: '0', // no margins
      top: (y+labelOffsets[1])+"%",
      left: (x+labelOffsets[0])+"%",
      whiteSpace:"nowrap",
      width:`${name.length * 9}px`, //adjust length based on length of text
      zIndex:9
    };

    //make sure border and showline are synced with whether this button considers itself selected for the line graph
    useEffect(() => {
        syncBorder();
        syncLine();
    }, [selected]);

    return (
        <div title={name} style={{top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
            <button
		className="mapButton"
                id={id}
                style={{
		    color: (id === "0" && selected && (globalLineBool || switches.get("select"))) ? "magenta" : "black",
		    backgroundColor: color,
		    boxShadow: globalLineBool || switches.get("select") ? borderStyle : "none",
                    top: y+"%",
                    left: x+"%",
		    zIndex: selected ? 2000 : 1000,
        	    clipPath: id === "0"
        	      ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
       	              : "none"
		    ,width: id === "0" ? "70px" : undefined
		    ,height: id === "0" ? "70px" : undefined
		    ,fontSize: id === "0" ? "1.5em" : undefined
                }}
                onClick={(event) => handleButtonClick(id, event)}  
            >
                {Math.round(val)}
            </button>
	    {(hover===hoverKey || switches.get(hoverKey)) ? (
		<input type="text" placeholder={name} style={labelStyle}/>
	    ):null}
        </div>
    );
}

export default Button;
