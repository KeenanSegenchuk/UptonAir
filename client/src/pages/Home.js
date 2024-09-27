import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Map from "../components/Map";

function Home() {
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

export default Home;