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

    //setup vars and static vals
    const [val, setVal] = useState("-1");
    const ranges = getObj("r");
    const colors = getObj("c");
    const [color, setColor] = useState("default");
    const name = getObj("$" + id);
    const labelOffsets = getObj("O" + id);
    const { globalLineBool, hover, switches, data, setData } = useAppContext();
    const [borderStyle, setBorderStyle] = useState("none");
    const hoverKey = "labels";

    //times
    const date = Date.now();
    const sec = 1000;
    const hour = sec * 60 * 60;
    const end = date/sec;

    //track selected data range
    const {dataContext} = useAppContext();
    const contexts = getObj("DataContexts");
    const [contextToggles, setContextToggles] = useState(new Array(contexts.length).fill(false));



    //----Data update handling----//

    //check if data already exists for current sensor
    const checkData = () => {
        //console.log(`Checking if data already exists; sensor = ${sensor_id} and context = ${dataContext}`)
        //console.log("Result: " + data.some(entry => entry.sensor === id && entry.context === dataContext));
        return data.some(entry => entry.sensor === id && entry.context === dataContext);
    };

    //pull data from API when clicked
    const getData= () => {
	if (globalLineBool)
		if(checkData()){
			setData(prev => prev.map(entry => entry.sensor===id ? ({...entry, showline:!entry.showline}):(entry)));
			return;
		}
	else
		if(checkData())
			return;
	const start = end - contexts[dataContext];
	api.get('aqi/time/' + start + "-" + end + '/' + id)
		.then(response => {
			//console.log("Existing Data:", data);
			//console.log("Sensor_id:", id);
			//console.log("Server's Response", response);
			setData(prev => [...prev, {context: dataContext, sensor:id, data:response.data.data, color:getObj("C"+id), showline:globalLineBool||id===0}]);
		}).catch(error => {
        		console.error('Error fetching data:', error);
               	});

    };







    //----Setup Button Element----//
    useEffect(() => {
        api.get('aqi/avg/'+(Math.floor((date-hour)/sec)+"-"+Math.floor(date / sec)+"/"+id))
            .then(response => {
                console.log("/aqi/avg API Response:",response);
		if(!response.data)
			{return;}
		setVal(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    // Calculate the color based on val
    useEffect(() => {
	for (let i = 0; i < ranges.length; i++) {
	    if (val < ranges[i]) {
                setColor(colors[i]);
                break;
            }
        }
    }, [val]);

    const handleButtonClick = (sensorValue, event) => {
	//update button border
        if (globalLineBool) {
	    const cidx = Object.keys(contexts).indexOf(dataContext);
	    const ctoggle = contextToggles[cidx];
	    if (ctoggle) {
		setBorderStyle("none");
	    }
	    else {
            	const borderColor = getObj("C" + id);
            	setBorderStyle("5px solid " + borderColor);
	    }
	    setContextToggles(prev => {
		const next = [...prev];
		next[cidx] = !ctoggle;
		return next;
	    });
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
		    outline: borderStyle,
                    top: y+"%",
                    left: x+"%",
		    zIndex: 10,
                }}
                onClick={(event) => handleButtonClick(id, event)}  
            >
                {Math.round(val)}
                {/* Button content can be added here */}
            </button>
	    {(hover===hoverKey || switches.get(hoverKey)) ? (
		<input type="text" placeholder={name} style={labelStyle}/>
	    ):null}
        </div>
    );
}

export default Button;
