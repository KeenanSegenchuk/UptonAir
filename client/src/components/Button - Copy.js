import React, { useRef, useEffect } from 'react';

const LineGraph = ({ data, color }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (data && data.length > 0) {
      //scale the graph
      const xValues = data.map(point => point.x);
      const yValues = data.map(point => point.y);
      const xMax = Math.max(...xValues);
      const yMax = Math.max(...yValues);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      //style line
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;

      //draw line
      ctx.beginPath();
      const scaleX = canvasWidth / xMax;
      const scaleY = canvasHeight / yMax;
      //first point
      ctx.moveTo(data[0].x * scaleX, canvasHeight - data[0].y * scaleY);
      //subsequent points
      data.forEach(point => {
        ctx.lineTo(point.x * scaleX, canvasHeight - point.y * scaleY);
      });

      //draw drawing
      ctx.stroke();
    }
  }, [data]);

  return (
    <div>
      <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
  );
};

export default LineGraph;