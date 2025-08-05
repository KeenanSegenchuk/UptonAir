import { getObj } from "./getObj";
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
		if(params.lo === -1)
			params.lo = Math.min(values);
		if(params.hi === -1)
			params.hi = Math.max(values);
		const blocks = mapColors(values, params.hi, params.lo, params.hiColor, params.loColor);
		return blocks.map(block => ({...layout, ...block}));
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
		//console.log("Entering getMidnights...");
		let clock = new Date(start*1000).toLocaleString("en-us", {timeZone: "America/New_york", hour: '2-digit',minute: '2-digit',second: '2-digit',hour12: false});
		clock = clock.split(":");
		//console.log("clock: " + clock);
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

    const colorMap = (val) => {
      const colors = getObj("c");
      const ranges = getObj("r");
      for(let i = 0; i < ranges.length; i++)
  	if(val<ranges[i])
  	    return colors[i];
      return colors[colors.length-1];
    };
  //average data into n bars
    const getBars = (b, n, start, end) => {
        if (b.data.length === n) return b.data;

        //const start = b.data[0][0];
        //const end = b.data[b.data.length - 1][0];
        const step = (end - start) / n;

        const X = new Array(n);
        const Y = new Array(n).fill(0);
        const counts = new Array(n).fill(0);

        // Bin the values by time
        for (const [x, y] of b.data) {
            const binIndex = Math.min(Math.floor((x - start) / step), n - 1);
	    Y[binIndex] += y;
            counts[binIndex]++;
        }

        // Compute bin centers and averages
        for (let i = 0; i < n; i++) {
            const binTime = start + (i + 1) * step;
            X[i] = binTime * 1000; // convert seconds to ms

            if (counts[i] > 0) {
                Y[i] = Y[i] / counts[i];
            } else {
                Y[i] = 0; 
            }
        }

        return {
            x: X,
            y: Y,
            type: "bar",
            marker: { color: Y.map(v => colorMap(v)) }
        };
    };

	switch (func.substring(0,3)) {
		case "get":
			switch(func.substring(3,func.length)) {
				case "Times":
					return getTimes;
				case "Blocks":
					return getBlocks;
				case "Gradient":
					return eChartsGradient;
				case "Bars":
					return getBars;
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
export { graphUtil };

