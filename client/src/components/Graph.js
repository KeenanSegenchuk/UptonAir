import React, { useEffect, useState, useCallback } from 'react';
import axios from "axios";
import Bar from "./Bar";
import Date from "./Date";

//TODO: fix loading, horizontalize dates, display bars
function Graph({ sensor_id, start, end }) {
	const [nBars, setnBars] = useState(30);
	const [bars, setBars] = useState([]);
    	const [graph, setGraph] = useState({"dates": [], "title": "", "data": []});
    	const [loading, setLoading] = useState(false);
    	const [error, setError] = useState(null);
	const [max, setMax] = useState(0);

	const gitBars = (data) => {
		console.log("getBars");
		const n = data.length;
		const barLen = Math.ceil(n/nBars);
		const brs = new Array(nBars);
		var count = 0;
		var sum = 0;
		var nm = false;
		var m = 0;
		data.forEach((point, index) => {
			sum += point;
			if (index%barLen === barLen-1) {
				sum = sum/barLen;
				nm = (sum>m)
				console.log("sum");
				console.log(sum);
				console.log("max");
				console.log(m);
				console.log(nm);
				if (nm) {console.log("setting new max"); m = sum;}
				brs[count] = sum; sum = 0; count++;}
		});
		setLoading(false);
		if(brs[brs.length-1] === undefined){brs.length = brs.length-1;}
		setBars(brs);
		setMax(m);
		console.log(brs);
	};

	useEffect(() => {
            console.log(sensor_id);
	    console.log(start);
	    setLoading(true);
            axios.get('http://localhost:5000/raw', { params: { sensor: sensor_id, start: start, end: end } })
                .then(response => {
                    console.log(response);
                    setGraph(response.data);
		    gitBars(response.data.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                    setError(error.message);
                    setLoading(false);
                });
    	}, [sensor_id, start, end]);

  const graphContainer = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '10px'
  };

  const graphElement = {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    marginBottom: '5px',
    justifyContent: 'space-between',
  };

if (loading)
	{return (<div className="loading-message">Loading...</div>);}
if (error)
	{return (<div className="error-message">Error: {error}</div>);}

return (<div>
        <div style={graphContainer}>
	    <div style={graphElement}>{graph.title}</div>
            <div style={{ ...graphElement, height: "105px" }}>
                {bars.map((bar, index) => (
                    <Bar key={index} val={bar} max={max}/>
                ))}
            </div>
	    <div style={{ ...graphElement, height: "55px" }}> {graph.dates.map((date, index) => (<Date key={index} text={date}/>))} </div>
			
        </div></div>
    );
}

export default Graph;