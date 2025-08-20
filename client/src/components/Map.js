import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import LeafletButton from "./LeafletButton";
import Button from "./Button";
import "../App.css";
import DButton from "./DButton";
import ToggleButton from "./ToggleButton";
import DashboardConfig from "./DashboardConfig";
import { useAppContext } from "../AppContext";

function Map({ buttons }) {
  // control map popup on mobile
  const { setPopup, map_type } = useAppContext();
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  // control config box popup
  const [showConfig, setShowConfig] = useState(false);

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
    color: map_type === "roads" ? "black" : "white",
    weight: 2,
    opacity: .6,
    fillOpacity: 0
  };

  return (
    <div id="Map.js" className="mapContainer" style={{ position: 'relative',
					   height: isMobile ? '100%' : undefined,
        				   width: isMobile ? '90vw' : undefined }}>

      {/* The Map */}
      <MapContainer
        center={[42.173996, -71.60191]} // Choose your map center
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        {map_type === "roads" ? (
	  <TileLayer
	    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
	    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
	  />
	):(
	  <TileLayer
            // Esri satellite imagery
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
          />
	)}
        {townBorder && <GeoJSON data={townBorder} style={townBorderStyle} />}

	{/* Place Sensors on Map */}
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


      {/* Config Popup */}
      {/* Icon */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000
        }}
      >
        <button
          onClick={() => setShowConfig(prev => !prev)}
          style={{
            background: 'transparent',
            borderRadius: '50%',
            fontSize: '40px',
            border: 'none',
            cursor: 'pointer'
          }}
          title="Settings"
        >
          ⚙️
        </button>
      </div>
      
      {/* Config Modal Overlay */}
      {showConfig && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1499,
          }}
          onClick={() => setShowConfig(false)}
        >
          <div
            style={{
              position: "absolute",
              maxHeight: "90%",
              top: "5%",
              left: "50%",
              transform: "translate(-50%)",
              width: "75%",
              backgroundColor: "rgba(240,255,240,0.95)",
              zIndex: 1500,
              padding: "20px",
              overflow: "auto",
              borderRadius: "10px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            <button
              onClick={() => setShowConfig(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
              title="Close"
            >
              ✕
            </button>
            <DashboardConfig />
          </div>
        </div>
      )}

      {/* HoverButton at top center */}
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "50%",
	  transform: "translate(-50%, 0%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}
      >
        {isMobile ? (
          <ToggleButton
            className="Button"
            textOn={"Select Multiple|Graph Multiple"}
            textOff={"Graph One"}
            toggleKey="select"
            style={{ height: "30px", fontSize:".85em"}}
          />
        ) : (
          /*<DButton
            className="Button"
            text={"Hover/Click here to show location names."}
            dkey="labels"
            style={{ height: "30px" }}
          />*/
        <div/>)}
      </div>
    </div>
  );
}

export default Map;