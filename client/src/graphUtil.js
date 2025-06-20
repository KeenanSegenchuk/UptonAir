function graphUtil(func) {

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

	const eChartsGradient = (start, end) => {
   	    const midnights = getMidnights(start, end);
	    const range = end - start;
    	    const mapValueToRange = value => (value - start) / range;

	    const powderBlue = "rgb(176, 224, 230)";
	    const darkBlue = "rgb(64, 125, 144)";
	    const colorStops = [];
	    const pushBoth = (current, half) => {
	        colorStops.push({ offset: current, color: darkBlue });
	        colorStops.push({ offset: half, color: powderBlue });
	    };
	
	    let current = mapValueToRange(midnights[0]);
	    let next = mapValueToRange(midnights[1]);
	    let half = (current + next) / 2;
	    const halfGap = half - current;

	    //check for colorstops where position < 0
	    if(half < 0) {
		const blendPercent = (0 - half)/(next - half);
		colorStops.push({offset: 0, color: mixColor(blendPercent, powderBlue, darkBlue)});
	    } else if(current < 0) {
		const blendPercent = (0 - current)/(half-current);
		colorStops.push({offset: 0, color: mixColor(blendPercent, darkBlue, powderBlue)});
		colorStops.push({offset: half, color: powderBlue});	
	    } else {
		pushBoth(current, half);}

	    //loop through all colorstops definitely in the gradient bounds
	    for (let i = 1; i < midnights.length - 1; i++) {
	        current = mapValueToRange(midnights[i]);
	        next = mapValueToRange(midnights[i + 1]);
	        half = (current + next) / 2;
		pushBoth(current, half);
	    }

	    const m = midnights.length;
	    current = mapValueToRange(midnights[m-1]);
	    half = (current + halfGap);
	    //check for colorstops where position > 1
	    if (half <= 1) {
		pushBoth(current, half);
	    } else if(current == 1) {
	        colorStops.push({ offset: current, color: darkBlue });
	    } else if(current < 1) {
	        colorStops.push({ offset: current, color: darkBlue });
		const blendPercent = (1 - current) / (half - current);
		colorStops.push({offset: 1, color: mixColor(blendPercent, darkBlue, powderBlue)});
	    } else {
		const prevHalf = current - halfGap;
		const blendPercent = (1 - prevHalf) / (current - prevHalf);
		colorStops.push({offset: 1, color: mixColor(blendPercent, powderBlue, darkBlue)});
	    }	

	    return {
	        type: 'linear',
	        x: 0, y: 0, x2: 1, y2: 0,
	        colorStops,
	        global: false
	    };
	};


	switch (func.substring(0,3)) {
		case "get":
			switch(func.substring(3,func.length)) {
				case "Times":
					return getTimes;
				case "Blocks":
					return;
				case "Gradient":
					return eChartsGradient;
				default:
					console.log("graphUtil.js does not recognize this input code")
			}
			break;
		default:
			switch(func) {
				case "midnightGradient":
					return eChartsGradient;
				case "linspace":
					return getTimes;
				default:
					console.log("graphUtil.js does not recognize this input code")
			}
	}
	return;
}


module.exports = { graphUtil };