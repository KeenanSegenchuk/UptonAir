import "../App.css";
import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import { getObj } from "../getObj";
import axios from 'axios';

function ChatBox( {assistant_id} ) {
    const {BASE_URL} = useAppContext();
    const API_URL = BASE_URL + "api/";
    const api = axios.create({
      baseURL: API_URL,
    });

    //LLM integration
    const [userPrompt, setUserPrompt] = useState("");
    const [lastPrompt, setLastPrompt] = useState("");
    const [response, setResponse] = useState("test");
    const [sessionID] = useState(() => Math.random().toString(36).slice(2));

    const [provideData, setProvideData] = useState(false);

    const {globalLineBool, compressedData, compressedSize, dataContext, data, lineMode, sensor_id, sensor_idAvgs, buttonAvgs, selectedSensors, units, lineUnits} = useAppContext();
    //^^^^^ ctx to provide to LLM. vvvvv ctx to provide to AppContext
    const {setShowChatBox, epsilon, setEpsilon, showCompression, setShowCompression} = useAppContext();
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
		else ctx = {...ctx, line_sensors: Object.keys(selectedSensors).filter(id => selectedSensors[id]).map(id => getObj("$" + id))};
	}
	return ctx;
    };


    const sendPrompt = () => {
	if (userPrompt === lastPrompt)
		return;
	setLastPrompt(userPrompt);
	
	const prompt = JSON.stringify({
	  user_prompt: userPrompt,
	  context: getCtx()
	});
	
	api.post("chat", {
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ "prompt": prompt, "id":  sessionID}),
		}).then(res => {
			console.log("ChatBot Response:", res);
			setResponse(res.data.response);
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

    return (
        <div id="ChatBox.js"> {/* TODO: MAKE WINDOW MOVEABLE AND RESIZEABLE */}
		<CloseButton/>
		<center>
			<h2>Ask a question:</h2>
			<input type="text" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} />
			<button onClick={sendPrompt} style={{width:"100%", padding:"15px"}}>Submit Question</button>
			

			<h3>Response:</h3>
			<div
			    style={{
				padding: "8px", border: "1px solid #ccc", borderRadius: "8px", overflowY: "auto",
				backgroundColor: "#fafafa", fontFamily: "monospace", whiteSpace: "pre-wrap",
			    }}
			>{response}</div>
		</center>
		<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", paddingTop:"10px" }}>
		  <h3 htmlFor="boolCheck">Advanced Context:</h3>
		  <input
		    type="checkbox"
		    checked={showCompression}
		    onChange={(e) => setShowCompression(e.target.checked)}
		    style={{ cursor: "pointer", width: "18px", height: "18px" }}
		  />
		</div>
		<span>Enabling advanced context allows you to compress the graph you see on the dashboard and show it to the chat bot.</span>
		
		{showCompression &&
			<center>
			    <div style={{marginTop:"0px", marginBottom:"25px", display:"flex", flexDirection: "column"}}>
				<h4 style={{marginTop:"5px"}}>{`Compression Level: ${epsilon}, Size: ${compressedSize}`}</h4>
				<input className="Marginless hideMobile"
			          type="range"
			          value={epsilon} min="0" max="30" step="0.1" 
			          onChange={(e)=>{setEpsilon(e.target.value)}}
			          style={{marginBottom: "-15px", marginTop: "-10px",  width: '60%', alignSelf: "center" }}
			        />
			    </div>  
			    <span style={{fontSize:".9em", marginTop:"0px"}}>Check the graph on the dashboard to check how the chat bot will see your data.</span> 
			    {/*<button onClick={()=>{setShowCompression(prev => !prev);}}>{showCompression ? "Graph raw data on dashboard" : "Graph compressed data"}</button>*/} {/* Manually control whether graph data is compressed or not */}
			</center>
		}
		<div style={{height: "15px"}}/>
		<center>
			<h3>Default Context:</h3>
			<div>
				By default the chatbot can see the current state of the dashboard except the data on the graph. To show data to the chatbot, you can enable "Advanced Context" above and compress the data.
			</div>
		</center>

		<center>
		    <h4 style={{marginTop:"15px", marginBottom:"0px"}}>Chat bot powered by OpenAI's o4-mini.</h4>
		</center>
	</div>
    );
}

export default ChatBox;