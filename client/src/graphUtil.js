function graphUtil(func) {
	const getMidnights = (start, end) => {
		console.log("Entering getMidnights...");
		let clock = new Date(start*1000).toLocaleString("en-us", {timeZone: "America/New_york", hour: '2-digit',minute: '2-digit',second: '2-digit',hour12: false});
		clock = clock.split(":");
		console.log("clock: " + clock);
		let midnights = [];
		
		var midnight = start;
		var seconds = 60*60;
		for(let i = 0; i < 3; i ++)
		{midnight -= clock[i]*seconds;
		 seconds/=60;}
		seconds = 60*60*24;
		
		while(midnight < end)
		{midnights.push(midnight);
		 midnight += seconds;}
		
		midnights.push(midnight);
		return midnights;
	};

		
	const midnightGradient = (start, end, midnights) => {	
		console.log("Entering midnightGradient...");	
		// Convert start and end bounds into a range [0, 1] for the gradient scale
		const range = end - start;

		// Helper function to map a value into a 0-1 range based on the start-end range
		function mapValueToRange(value) {
			return (value - start) / range;
		}

		// Define the two colors: powderblue and darkblue
		const powderBlue = "rgb(176, 224, 230)"; // Powderblue
		const darkBlue = "rgb(64, 125, 144)"; // Darkblue

		// Create color stops
		let colorStops = [];

		// Add a starting point for powderblue
		colorStops.push(`${powderBlue} 0%`);

		let positions = [];		

		// For each pair of consecutive midnights
		for (let i = 0; i < midnights.length - 1; i++) {
			// Get the positions for the current and next midnight
			const currentMidnight = midnights[i];
			const nextMidnight = midnights[i + 1];
			
			// Normalize their positions as percentages
			const currentPos = mapValueToRange(currentMidnight) * 100;
			const nextPos = mapValueToRange(nextMidnight) * 100;
			positions.push(currentPos);

			// Add darkblue at the current midnight
			colorStops.push(`${darkBlue} ${currentPos}%`);
			
			// Add powderblue at the halfway point between the current and next midnight
			const halfwayPos = (currentPos + nextPos) / 2;
			colorStops.push(`${powderBlue} ${halfwayPos}%`);
			
			if(i==midnights.length - 2) {
			// Add darkblue again at the next midnight
			colorStops.push(`${darkBlue} ${nextPos}%`);}
		}

		// Add the final color stop (powderblue at the end)
		colorStops.push(`${powderBlue} 100%`);

		// Return the CSS gradient string
		return {gradient: `linear-gradient(to right, ${colorStops.join(", ")})`, 
			positions: positions};
	};

	const options = {
	    timeZone: 'America/New_York',
	    month: '2-digit',
	    day: '2-digit',
	    year: 'numeric',
	    hour: '2-digit',
	    minute: '2-digit',
	    second: '2-digit',
	    hour12: false
	  };

	const getTimes = (x, y, n) => {
		console.log("Entering getTimes...");
  		const step = (y - x) / (n - 1); 
  		const result = new Array(n);
		//console.log("step:");
		//console.log(step);		

  		for (let i = 0; i < n; i++) {
	    		result[i] = Math.round(x + i * step); 
  		}
		//console.log("results:");
		//console.log(result);		

  		return result;
	};

	const getDates = (timestamps) => {
	  console.log("Entering getDates...");

	  const result = new Array(timestamps.length);

	  for (let i = 0; i < timestamps.length; i++) {
	    const timestamp = timestamps[i];
	    const date = new Date(timestamp * 1000); 
	
	    //console.log(`Processing timestamp: ${timestamp}`);
    	    //console.log(`Date object: ${date.toString()}`);
	    const formattedDate = date.toLocaleString('en-US', options);

	    //console.log(`Formatted date: ${formattedDate}`);
	
	    result[i] = formattedDate;}
	  return result;
	};
	const getStyle = (x, y, args) => {
		//TODO: Use graphUtil functions to configure plotly.js graphs

	};

	const gitBars = (data, nBars) => {
		console.log("Entering gitBars...");
		//console.log(data);
		//console.log(nBars);
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
				nm = (sum>m)/*
				console.log("sum");
				console.log(sum);
				console.log("max");
				console.log(m);
				console.log(nm);*/
				if (nm) {/*console.log("setting new max");*/ m = sum;}
				brs[count] = sum; sum = 0; count++;}
		});
		if(brs[brs.length-1] === undefined){brs.length = brs.length-1;}
		//console.log(brs);
		return [brs, m];
	};

	switch (func.substring(0,3)) {
		case "get":
			switch(func.substring(3,func.length)) {
				case "Dates":
					return getDates;
				case "Times":
					return getTimes;
				case "Bars":
					return gitBars;
				case "Midnights":
					return getMidnights;
			}
		default:
			switch(func) {
				case "midnightGradient":
				case "gradient":
					return midnightGradient;
				case "linspace":
					return getTimes;
			}
	}
	return;
}


module.exports = { graphUtil };