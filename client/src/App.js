import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState({});
  const [quality, setQuality] = useState({});

  useEffect(() => {
    // Fetch members
    fetch("/members")
      .then(res => res.json())
      .then(data => {
        setData(data);
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
  }, []);

  return (
    <div>
      {/* This fetches members from the backend and presents them on the frontend */}
      {typeof data.members === 'undefined' ? (
        <p>Loading members...</p>
      ) : (
        data.members.map((member, i) => (
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

