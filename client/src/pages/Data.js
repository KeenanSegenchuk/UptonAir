import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Graph from '../components/Graph';

function Data() {
    	const [data, setData] = useState([]);
    	const [loading, setLoading] = useState(true);
    	const [error, setError] = useState(null);

	return  <div>
		    <Graph sensor_id={221881} start="11/1/2024" end="11/7/2024"/>
		</div>	
}

export default Data;