import React, { useRef, useEffect } from 'react';

const LineGraph = ({ data, gradient, h, w }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    console.log("Entering LineGraph..." + gradient);
    if (!canvas || !ctx) {
      console.error("Canvas or context is not available");
    }

    if (data && data.length > 0) {
      //scale data
      const allXValues = data.flatMap(item => item.data.map(point => point[0]));
      const allYValues = data.flatMap(item => item.data.map(point => point[1]));
      const xMax = Math.max(...allXValues);
      const xMin = Math.min(...allXValues);
      const yMax = Math.max(...allYValues);
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight); //clear previous drawing

	
      console.log(data);
console.log("xM: "+xMax);
console.log("yM: "+yMax);
      data.forEach((obj, index) => {
        //line style
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const scaleX = canvasWidth / (xMax-xMin);
        const scaleY = canvasHeight / yMax;

        //first data point
	if (obj.data.length !== 0){
          const firstPoint = obj.data[0];
          ctx.moveTo((firstPoint[0]-xMin) * scaleX, canvasHeight - firstPoint[1] * scaleY);
          //subsequent points
          obj.data.forEach(point => {
	    console.log("Point: " + (point[0]-xMin) * scaleX + "," + canvasHeight - point[1] * scaleY);
            ctx.lineTo((point[0]-xMin) * scaleX, canvasHeight - point[1] * scaleY);
          });
	  console.log("first point: " + firstPoint);
          //draw line
          ctx.stroke();console.log("stroke");}
	else {console.log("Sensor data missing for sensor: " + obj.sensor[1]);}
      });
      //console.log(canvas.width, canvas.height);
    }
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ background: gradient, border: '1px solid black' }} width={w} height={h}></canvas>
    </div>
  );
};

export default LineGraph;