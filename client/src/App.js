import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Map({ buttons }) {
    return (
        <div className="map-container" style={{ position: 'relative' }}>
            <img src="/figs/upton.jpg" alt="Map" />
            <div className="sensor-overlay" style={{ position: 'absolute', top: 0, left: 0 }}>
                {buttons.map((button, index) => (
                    <Button key={index} x={button.x} y={button.y} color={button.color} />
                ))}
            </div>
        </div>
    );
}

const Button = ({ x, y, color }) => {
    return (
        <button
            style={{
                position: 'absolute',
                width: '30px',
                height: '30px',
                top: y,
                left: x,
                backgroundColor: color,
            }}
        >
            {/* Button content can be added here */}
        </button>
    );
};


function App() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("App Rendered.");

    useEffect(() => {
        axios.get('http://localhost:5000/map')
            .then(response => {
                console.log(response);
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (error) {
        return <h1>Error: {error.message}</h1>;
    }

    return (
        <div>
            <h1>Map:</h1>
            <Map buttons={data} />
        </div>
    );
}

export default App;
