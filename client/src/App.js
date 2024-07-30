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
        <p>Loading..</p>
      ) : (
        data.members.map((member, i) => (
          <p key={i}>{member}</p>
        ))
      )}
    </div>
  );
}

export default App;