import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import "../App.css";
import { Link } from 'react-router-dom'
const { getObj } = require("../getObj");
const sensors = getObj("positions");



function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        axios.get('http://localhost:5000/PGtest')
            .then(response => {
                console.log("Homepage API Response:",response);
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
        return <h1>Loading... </h1>;
    }

    if (error) {
        return <h1>Error: {error.message}</h1>;
    }

    return (
	<div>
		{data.map((line, index) => (
			<div>{line}</div>
		))}
	</div>
    );
}

export default Home;

