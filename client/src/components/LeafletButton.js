import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

function LeafletButton({ button, children }) {
  const map = useMap();
  const [pos, setPos] = useState(null);

  const updatePosition = () => {
    const point = map.latLngToContainerPoint([button.lat, button.lon]);
    setPos({ x: point.x, y: point.y });
  };

  useEffect(() => {
    updatePosition();
    map.on('move zoom resize', updatePosition);
    return () => {
      map.off('move zoom resize', updatePosition);
    };
  }, [map, button.lat, button.lon]);

  if (!pos) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.x - 20,  // center it
        top: pos.y - 20,
        pointerEvents: 'auto',  // make sure it can be clicked
        zIndex: 500,
      }}
    >
      {children}
    </div>
  );
}

export default LeafletButton;