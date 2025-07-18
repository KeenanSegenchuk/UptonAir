import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LeafletButton from "./LeafletButton";
import Button from "./Button";
import "../App.css";
import DButton from "./DButton";
import ToggleButton from "./ToggleButton";
import { useAppContext } from "../AppContext";

function Map({ buttons }) {
  const { setPopup } = useAppContext();

  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  const triggerPopup = () => {
    if (isMobile) {
      setPopup(true);
    }
  };

  //import town border from geojson
  const [townBorder, setTownBorder] = useState(null);
  useEffect(() => {
    fetch('/upton.geojson')
      .then((response) => response.json())
      .then((data) => setTownBorder(data))
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, []);
  const townBorderStyle = {
    color: "white",
    weight: 2,
    opacity: .6,
    fillOpacity: 0
  };

  return (
    <div className="mapContainer" style={{ position: 'relative',
					   height: isMobile ? '70vh' : undefined,
        				   width: isMobile ? '90vw' : undefined }}>
      <MapContainer
        center={[42.173996, -71.60191]} // Choose your map center
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          // Example Esri satellite imagery
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
        />
        {townBorder && <GeoJSON data={townBorder} style={townBorderStyle} />}

        {buttons.map((button, index) => (
          <LeafletButton key={index} button={button}>
            <Button
              val={button.avg}
              id={button.id}
              lon={button.lon}
              lat={button.lat}
              onClick={() => triggerPopup()}
            />
          </LeafletButton>
        ))}
      </MapContainer>

      {/* Overlay at top center */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}
      >
        {isMobile ? (
          <ToggleButton
            className="Button"
            textOn={"Select Multiple|Graph Multiple"}
            textOff={"Graph One"}
            toggleKey="select"
            style={{ height: "30px" }}
          />
        ) : (
          <DButton
            className="Button"
            text={"Hover/Click here to show location names."}
            dkey="labels"
            style={{ height: "30px" }}
          />
        )}
      </div>
    </div>
  );
}

export default Map;