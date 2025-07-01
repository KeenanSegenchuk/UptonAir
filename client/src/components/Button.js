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
    const labelOffsets = getObj("O" + id);
    const { globalLineBool, hover, switches, data, setData, setPopup } = useAppContext();
    const [borderStyle, setBorderStyle] = useState("none");
    const hoverKey = "labels";

    //times
    const [end] = useState(() => Math.floor(Date.now() / 1000));

    //track selected data range
    const {dataContext, setSensor_id} = useAppContext();
    const [contexts] = useState(() => getObj("DataContexts"));
    const [contextToggles, setContextToggles] = useState(new Array(Object.keys(contexts).length).fill(false));

    //----Data update handling----//

    //check if data already exists for current sensor
    const checkData = () => {
        //console.log(`Checking if data already exists; sensor = ${sensor_id} and context = ${dataContext}`)
        //console.log("Result: " + data.some(entry => entry.sensor === id && entry.context === dataContext));
        return data.some(entry => entry.sensor === id && entry.context === dataContext);
    };

    //pull data from API when clicked
    const getData = () => {
	if (globalLineBool)
		if(checkData()){
			console.log("Toggling line graph line for sensor:", id);
			setData(prev => prev.map(entry => entry.sensor===id && entry.context===dataContext? ({...entry, showline:!entry.showline}):(entry)));
			return;
		}
	else
		setSensor_id(id);
		if(checkData())
			return;
	//console.log(contexts);
	//console.log(contexts[dataContext]);
	const start = end - contexts[dataContext];
	api.get('aqi/time/' + start + "-" + end + '/' + id)
		.then(response => {
			//console.log("Existing Data:", data);
			//console.log("Sensor_id:", id);
			//console.log("Server's Response", response);
			if(!checkData())
				setData(prev => {if(prev.some(entry => entry.sensor === id && entry.context === dataContext))
							return prev;
						return [...prev, {context: dataContext, sensor:id, data:response.data.data, color:getObj("C"+id), showline:globalLineBool||id==="0"|| switches.get("select")}];
					});

		}).catch(error => {
        		console.error('Error fetching data:', error);
               	});

    };


    //fetch updated data and handle border changes when context changes
    const [seenContexts, setSeenContexts] = useState(new Set());
    useEffect(() => {
	const cidx = Object.keys(contexts).indexOf(dataContext);
	const ctoggle = contextToggles[cidx];
	if(id === "0" && !seenContexts.has(dataContext))
	{
		console.log("here", ctoggle);
		getData()
        	const borderColor = getObj("C" + id);
        	setBorderStyle("5px solid " + borderColor);
		setSeenContexts(prev => prev.add(dataContext));
		setContextToggles(prev => {
			const next = [...prev];
			next[cidx] = true;
			return next;
		});

	}else{
		console.log("here2", ctoggle);
		if (!ctoggle) {
		    setBorderStyle("none");
		} else {
	            const borderColor = getObj("C" + id);
	            setBorderStyle("5px solid " + borderColor);
		}
	}
    }, [dataContext]);

    if(id === "0"){
	console.log(contextToggles);
	console.log(borderStyle);
    }

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
	    console.log(dataContext);
	    const cidx = Object.keys(contexts).indexOf(dataContext);
	    const ctoggle = contextToggles[cidx];
	    if (ctoggle) {
		console.log(id);
		setBorderStyle("none");
	    }
	    else {
            	const borderColor = getObj("C" + id);
            	setBorderStyle("5px solid " + borderColor);
		console.log("Enabled border");
	    }
	    setContextToggles(prev => {
		const next = [...prev];
		next[cidx] = !ctoggle;
		return next;
	    });
        }else{
	    setSensor_id(id);
	    if(isMobile) {
		setPopup(true);
	    }
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

    return (
        <div title={name} style={{top: 0, left: 0, right: 0, bottom: 0, position:"absolute"}}>
            <button
		className="mapButton"
                type="button"
                id={id}
                style={{
		    backgroundColor: color,
		    outline: globalLineBool || switches.get("select") || isMobile ? borderStyle : "none",
                    top: y+"%",
                    left: x+"%",
		    zIndex: 10,
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
