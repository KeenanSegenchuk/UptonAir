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


	switch (func.substring(0,3)) {
		case "get":
			switch(func.substring(3,func.length)) {
				case "Times":
					return getTimes;
				case "Blocks":
					return getBlocks;
				default:
					console.log("graphUtil.js does not recognize this input code")
			}
			break;
		default:
			switch(func) {
				case "linspace":
					return getTimes;
				default:
					console.log("graphUtil.js does not recognize this input code")
			}
	}
	return;
}


module.exports = { graphUtil };