import "../App.css";
import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";
import axios from 'axios';

function ChatBox( {assistant_id} ) {
    //LLM integration
    const [userPrompt, setUserPrompt] = useState("");
    const [lastPrompt, setLastPrompt] = useState("");
    const [response, setResponse] = useState("test");

    const {globalLineBool, compressedData, dataContext, data, lineMode, sensor_id, sensor_idAvgs, buttonAvgs, selectedSensors, units, lineUnits} = useAppContext();
    //^^^^^ ctx to provide to LLM. vvvvv ctx to provide to AppContext
    const {setShowChatBox, epsilon, setEpsilon, showCompression, setShowCompression} = useAppContext();
    const ctxFormat = {
	button_avgs: {},
	sensor_avgs: {},
	sensor_name: "",
	unit: "",
	graphMode: "",
	timespan: "",
	data: [], //the length of data passed to the assistant should be relatively small, so hevily compressed if multiple lines or long timespan
		
    };
    const optionalCtx = {
        //only pass these if graphMode = line
	line_mode: "", 
	line_units: "", //only if lineMode == units
	line_sensors: "", //only if lineMode == sensors
    };


    const getCtx = () => {
	let ctx = {
		sensor_name: getObj("$" + sensor_id),
		sensor_avgs: sensor_idAvgs,
		button_avgs: buttonAvgs,
		unit: units,
		graphMode: globalLineBool ? "bar" : "line",
		timespan: dataContext,
		data: compressedData
	};
	if (!globalLineBool) { //idk why globallinebool false means line mode, but it does
		ctx = {...ctx, line_mode: lineMode};
		if (lineMode === "units") ctx = {...ctx, line_units:lineUnits};
		else ctx = {...ctx, line_sensors: selectedSensors.map((id) => getObj("$" + id))};
	}
	return ctx;
    };


    const sendPrompt = () => {
	if (userPrompt === lastPrompt)
		return;
	setLastPrompt(userPrompt);
	
	axios.get("openAI assistant API")
		.then(resp => {
			setResponse(resp);
		}).catch(error => {
			console.error("Error querying chat bot:", error);
	});

    };


    const CloseButton = () => {
      <button
        onClick={() => setShowChatBox(false)}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "25px",
          height: "25px",
          cursor: "pointer",
          fontWeight: "bold",
          lineHeight: "0",
          textAlign: "center",
          padding: "0"
        }}
      >
        ×
      </button>
    };

    const AnswerBox = ({ text }) => {
	<div
	    style={{
		border: "1px solid #ccc",
		padding: "8px",
		overflowY: "auto",
		borderRadius: "8px",
		backgroundColor: "#fafafa",
		fontFamily: "monospace",
		whiteSpace: "pre-wrap",
	    }}
	>{text}</div>
    };

    return (
        <div id="ChatBox.js"> {/* TODO: MAKE WINDOW MOVEABLE AND RESIZEABLE */}
		<CloseButton/>
		<center><h4>Chat bot powered by OpenAI's o4-mini.</h4>
			<h1>Ask a question:</h1>
			<input type="text" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} />
			<button onClick="sendPrompt" style={{width:"100%", padding:"15px"}}>Submit Question</button>
			<AnswerBox text={response}/>
		</center>
		<center>
		    <button onClick={()=>{setShowCompression(prev => !prev);}}>{showCompression ? "Graph raw data on dashboard" : "Graph compressed data on dashboard (what the chatbox sees)"}</button>
		    <div style={{display:"flex", flexDirection: "column"}}>
			<h4>Compression Level:</h4>
			<input className="Marginless hideMobile"
		          type="range"
		          min="0"
		          max="5"
			  step="0.1"
		          value={epsilon}
		          onChange={(e)=>{setEpsilon(e.target.value)}}
		          style={{ width: '60%' }}
		        />
		    </div>
		</center>
	</div>
    );
}

export default ChatBox;