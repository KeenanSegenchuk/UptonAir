import React, { useEffect, useState } from 'react';
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

    //debug logging
    const l = false;
    const log = (txt, val) => {
	if(!l) return;
	if(val) console.log(txt, val);
	else    console.log(txt);
    }

    //check if mobile to let buttons enable sensorinfo popup
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    //setup vars and static vals
    const [val, setVal] = useState({"PMA":-1, "PMB":-1, "PMEPA":-1, "PM": -1, "AQI":-1, "AQIEPA":-1, "percent_difference":-1, "humidity":-1});
    const ranges = getObj("r");
    const colors = getObj("c");
    const [color, setColor] = useState("default");
    const name = getObj("$" + id);
    const borderColor = getObj("C" + id);
    const labelOffsets = getObj("O" + id);
    const { globalLineBool, units, hover, switches, data, setData, setPopup, lineMode, newLineUnit, lineUnits, isLineSelected, toggleLineSelect, selectSensor, setButtonAvgs } = useAppContext();
    const [borderStyle, setBorderStyle] = useState("none");
    const hoverKey = "labels";

    //times
    const [end] = useState(() => Math.floor(Date.now() / 1000));

    //track selected data range
    const {dataContext, setSensor_id, sensor_id} = useAppContext();
    const [contexts] = useState(() => getObj("DataContexts"));
    const [selected, setSelected] = useState(isLineSelected(id));
    useEffect(() => {
	//console.log("isLineSelected(id): ", isLineSelected(id));
	setSelected(isLineSelected(id)); //Update if Selection from Menu changes
	getData(false);
    }, [isLineSelected(id)] );

    //check for new line graph units/measurements
    useEffect(() => {
	if (id === sensor_id)
	    getData(false, newLineUnit);
    }, [newLineUnit]);

    //check when switching back to sensor-select for line graph
    useEffect(() => {
	if (selected && lineMode === "sensors") {
	    console.log(`LineMode changes, fetching line, Sensor: ${name}`);
	    getData();
	}
    }, [lineMode]);

    //----Data update handling----//


    //check if data already exists for current sensor
    const checkData = (forceUnits) => {
        //console.log(`Checking if data already exists; sensor = ${sensor_id} and context = ${dataContext}`)
        //console.log("Result: " + data.some(entry => entry.sensor === id && entry.context === dataContext));
	const UNITS = forceUnits ?? units;
        return data.some(entry => entry.sensor === id && entry.context === dataContext && entry.units === UNITS);
    };

    //Load sensor avg on mount for desktop
    useEffect(() => {
	log("Mounting with global sensor: ", sensor_id); 
	if(id === sensor_id) {
		console.log("Loading default sensor on mount.");
		getData();
	}
    }, []);



    //pull data from API when clicked
    const getData = (forceSelect, forceUnits) => {
	//console.log("Button clicked! ID: ", id);

	if(checkData(forceUnits))
		return;
	//console.log("About to pull data...");
	//console.log(`Sensor ${id}, units: ${units}, checkdata: ${checkData()}`); 

	const UNITS = forceUnits ?? units;
	const start = end - contexts[dataContext];
	api.get(`time/${UNITS}/${start}-${end}/${id}`)
		.then(response => {
			//console.log("Existing Data:", data);
			//console.log("Sensor_id:", id);
			//console.log("Server's Response", response);
			log(`Sensor ${id}, UNITS: ${UNITS}, checkdata: ${checkData()}`); 
	
			setData(prev => {
				if(prev.some(entry => entry.sensor === id && entry.context === dataContext && entry.units === UNITS))
					return prev;
				return [...prev, {context: dataContext, sensor:id, units:UNITS, data:response.data.data, color:getObj("C"+id), showline: forceSelect === undefined ? selected : forceSelect}];
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
	if(id === sensor_id && globalLineBool && lineMode === "sensors")
	{
		selectSensor(id); //set true in context var
		setSelected(true);
	}
    }, [globalLineBool]);

    //fetch updated data when time context/units changes
    useEffect(() => {
	log(`Sensor ${sensor_id}, units: ${units}, checkdata: ${checkData()}`); 
	if(id === sensor_id || (globalLineBool && lineMode === "sensors" && selected)) {
		if(globalLineBool && lineMode === "units")
			lineUnits.forEach((unit) => getData(false, unit));
		else {
			console.log(`DataContext/Unit Change... Sensor:${name} DataContext:${dataContext}`);
			getData();
		}
	}
    }, [dataContext, units]);
    //fetch updated data when lineUnits changes

    //----Setup Button Element----//
    useEffect(() => {
	if (val[units] === -1)
          api.get(`avg/${units}/${end - 60 * 60}-${end}/${id}`)
            .then(response => {
                log("/aqi/avg API Response:",response);
		if(!response.data)
			{console.log("Error getting button value."); 
			return;}
		setVal(prevVal => ({...prevVal,[units]: response.data}));
		setButtonAvgs(prev => ({...prev,name:response.data}));
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, [units]);

    // Calculate the color based on val
    useEffect(() => {
	setColor(getObj(`X${val[units]}${units}`));
	return;

	//console.log(val);
	if(["PMA", "PMB", "PMEPA", "PM"].includes(units))
	{   setColor("aqua"); return;   }
	for (let i = 0; i < ranges.length; i++) {
	    if (val[units] < ranges[i]) {
                setColor(colors[i]);
                break;
            }
        }
    }, [val, units]);

    const handleButtonClick = (sensorValue, event) => {
        if ((globalLineBool && lineMode === "sensors") || switches.get("select")) {
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
	    toggleLineSelect(id);
	    return;
        }
	if (globalLineBool && lineMode === "units")
	{ 
		lineUnits.forEach((unit) => getData(false, unit));
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
        <div title={name} id="Button.js" style={{top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
            <button
		className="mapButton"
                id={id}
		
                style={{
		    //color: (id === "0" && selected && lineMode === "sensors" && (globalLineBool || switches.get("select"))) ? "magenta" : "black",
		    backgroundColor: color,
		    boxShadow: (lineMode === "sensors" && (globalLineBool || switches.get("select"))) ? borderStyle 
				: ((/*lineMode === "units" && globalLineBool &&*/ id === sensor_id) ? `0 0 0 5px ${borderColor}` 
				: "none"),
                    top: y+"%",
                    left: x+"%",
		    zIndex: selected ? 2000 : 1000,
        	    /*clipPath: id === "0"
        	      ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
       	              : "none", THIS MAKES TOWN AVG BUTTON A STAR*/
		    width: id === "0" ? "50px" : undefined,
		    height: id === "0" ? "50px" : undefined,
		    fontSize: id === "0" ? "1.5em" : "1.05em" //undefined
                }}
                onClick={(event) => handleButtonClick(id, event)}  
            >
                {val && val[units] !== undefined && val[units] !== -1 ? Math.round(val[units]) : "N/A"}

            </button>
	    {(hover===hoverKey || switches.get(hoverKey)) ? (
		<input type="text" placeholder={name} style={labelStyle}/>
	    ):null}
        </div>
    );
}

export default Button;
