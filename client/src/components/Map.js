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
import config from '../config.json';

function Map({ buttons }) {
  // control map popup on mobile
  const { setPopup, show_roads } = useAppContext();
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  const triggerPopup = () => {
    if (isMobile) {
      setPopup(true);
    }
  };

  //import town border from geojson
  const [townBorder, setTownBorder] = useState(null);
  useEffect(() => {
    fetch('/town.geojson')
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
    <div tutorial-label="Map" id="Map.js" className="mapContainer" style={{ position: 'relative',
					   height: isMobile ? '100%' : undefined,
        				   width: isMobile ? '90vw' : undefined }}>

      {/* The Map */}
      <MapContainer
	center={[
	  Number(config.LATITUDE),
	  Number(config.LONGITUDE)
	]}
	zoom={Number(config.MAP_ZOOM)}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          // Esri World Imagery Wayback: a specific dated capture instead of
          // Esri's "current" mosaic, which can flip to a bare fall/winter
          // pass for a region. Release number picks the date; find a
          // greener one at https://livingatlas.arcgis.com/wayback/ and
          // update config.WAYBACK_RELEASE if this one isn't summery enough.
          url={`https://wayback.maptiles.arcgis.com/arcgis/rest/services/world_imagery/wmts/1.0.0/default028mm/mapserver/tile/${config.WAYBACK_RELEASE}/{z}/{y}/{x}`}
          attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye'
        />
        {show_roads && (
          <>
            {/* Esri's transparent road-network overlay, meant to sit on top of World Imagery */}
            <TileLayer
              url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
            />
            <TileLayer
              url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
            />
          </>
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


      {/* Config gear icon, roads toggle, and settings popup — all owned by DashboardConfig */}
      <DashboardConfig />

      {/* HoverButton at top center */}
      {isMobile && 
        <div
          style={{
            position: "absolute",
            top: "2.5%",
            left: "50%",
	    transform: "translate(-50%, 0%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
	    width: "40%"
          }}
        >
	  <button
		className="bordered green"
		onClick={() => setPopup(true)}
		style={{ height: "45px", width: "100%", fontSize: "1em"}}
	  >Show Graph</button>
          {/*
	   <ToggleButton
            className="Button"
            textOn={"Select Multiple|Graph Multiple"}
            textOff={"Graph One"}
            toggleKey="select"
            style={{ height: "30px", fontSize:".85em"}}
           />
	  */}
        </div>
      }
    </div>
  );
}


export default Map;

