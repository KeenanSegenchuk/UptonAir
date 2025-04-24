function graphUtil(func) {
	const getBlocks = (values, params, layout) => {
	//Return color blocks for graph background	
		const default_params = {
			fn: (x) => x,
			lo: -1,
			hi: -1,
			loColor: "rgb(255, 255, 255)",
			hiColor: "rgb(0,0,0)",
		};
		params = {...default_params, ...params};
		values = values.map(val => params.fn(val));
		if(params.lo == -1)
			params.lo = Math.min(values);
		if(params.hi == -1)
			params.hi = Math.max(values);
		const blocks = mapColors(values, params.hi, params.lo, params.hiColor, params.loColor);
		return blocks.map(block => ({...layout, ...block}));
	};	 
	const mixColor = (percent, color1, color2) => {
		//console.log("mixing colors: ", percent, color1, color2);
		color1 = color1.match(/\d+/g).map(Number);
		color2 = color2.match(/\d+/g).map(Number);
		const color = [Math.round(color1[0] + (color2[0] - color1[0]) * percent),
			       Math.round(color1[1] + (color2[1] - color1[1]) * percent),
			       Math.round(color1[2] + (color2[2] - color1[2]) * percent)];
		//console.log("mixed color: ", color);
		return "rgb("+color[0]+","+color[1]+","+color[2]+")";
	};
	const mapColors = (values, lo, hi, loColor, hiColor) => {
	//maps values to a color gradient where (val-low)/(hi-low)% of the way from loColor to hiColor 
		let blocks = [];
		const diff = hi-lo;
		const percent = (x, min, diff) => {const val = (x-min)/diff; if(val < 0){return 0;} if(val > 1){return 1;} return val;}; 
		let x = 0;
		const step = 1/values.length;
		values.forEach(val => {blocks.push({fillcolor:mixColor(percent(val, lo, diff), loColor, hiColor), x0:x, x1:x+step}); x+=step;});
		
		return blocks;
	};

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
		//console.log("Entering getTimes...");
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
				case "Blocks":
					return getBlocks;
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