import React, { useRef, useEffect } from 'react';

const VertAxis = ({ values, h, bh }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tickSpacing = h / (values.length); // Space between ticks (including top/bottom)

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the vertical axis line (at the right border of the canvas)
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, h);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the ticks and labels
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';  // Align text to the right of the tick

    values.forEach((value, index) => {
      // Adjust y position so that top and bottom ticks align with the canvas border
      const y = bh + tickSpacing * (index);  // Evenly space the ticks

      // Draw the tick line (positioned to the left of the axis line)
      ctx.beginPath();
      ctx.moveTo(canvas.width, y);  // Position the tick mark to the left of the axis
      ctx.lineTo(canvas.width - 10, y);  // Shorten the tick to the left
      ctx.stroke();

      // Draw the label (positioned left of the tick line)
      ctx.fillText(value, canvas.width - 15, y);  // Label positioned to the left of the tick
    });
  }, [values, h]);

  return (
    <canvas
      ref={canvasRef}
      width="60"
      height={h}
    />
  );
};

export default VertAxis;