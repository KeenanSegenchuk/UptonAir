import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

function LeafletButton({ button, children, clipOnBoundary = true }) {
  const map = useMap();
  const [pos, setPos] = useState(null);

  const hasValidCoords = Number.isFinite(button?.lat) && Number.isFinite(button?.lon);

  const updatePosition = () => {
    if (!hasValidCoords) {
      setPos(null);
      return;
    }

    try {
      let point = map.latLngToContainerPoint([button.lat, button.lon]);

      if (clipOnBoundary) {
        const size = map.getSize();
        point.x = Math.max(0, Math.min(point.x, size.x));
        point.y = Math.max(0, Math.min(point.y, size.y));

	//set 
      }

      setPos({ x: point.x, y: point.y });
    } catch (error) {
      console.error('LeafletButton projection error:', error);
      setPos(null);
    }
  };

  useEffect(() => {
    updatePosition();
    map.on('move zoom resize', updatePosition);
    return () => {
      map.off('move zoom resize', updatePosition);
    };
  }, [map, button.lat, button.lon]);

  if (!hasValidCoords || !pos) return null;

  const style = {
    position: 'absolute',
    left: button.id === "0" ? map.getSize().x-70: pos.x - 10, // or whatever value
    top: button.id === "0" ? 0 : pos.y - 10,
    pointerEvents: 'auto',
    zIndex: 1000,
  };

  return (
    <div
      style={style}
    >
      {children}
    </div>
  );
}

export default LeafletButton;