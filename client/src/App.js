import React, { useState, useEffect } from 'react';
import Map from "./components/Map";

function App() {
  const [mapdata, setMapData] = useState({});
  const [quality, setQuality] = useState({});
  const [membersc, setMembersc] = useState({});
  useEffect(() => {
    // Fetch members
    fetch("/members")
      .then(res => res.json())
      .then(membersc => {
        setMembersc(data);
        console.log("Members:", data);
      })
      .catch(error => console.error("Error fetching members:", error));
    // Fetch quality
    fetch("/quality")
      .then(res => res.json())
      .then(quality => {
        setQuality(quality);
        console.log("Quality:", quality);
      })
      .catch(error => console.error("Error fetching quality:", error));
    fetch("/map")
      .then(response => {
          console.log(response);
          setMapData(response.data);
      })
      .catch(error => {
          console.error('Error fetching map data:', error);
      })
  }, []);
  return (
    <div>
      {/* This fetches sensor 1-day averages and locations and creates buttons on the map at those locations with color indicating 1-day average range */}
      <h1>Map:</h1>
      <Map buttons = {mapdata} />
    
      {/* This fetches members from the backend and presents them on the frontend */}
      {typeof membersc.members === 'undefined' ? (
        <p>Loading members...</p>
      ) : (
        membersc.members.map((member, i) => (
          <p key={i}>{member}</p>
        ))
      )}
      {/* This fetches quality data from the backend and presents it on the frontend */}
      {Object.keys(quality).length === 0 ? (
        <p>Loading quality...</p>
      ) : (
        Object.keys(quality).map((date, i) => (
          <div key={i}>
            <h3>{date}</h3>
            {quality[date].map((item, j) => (
              <p key={j}>{item}</p>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default App;
