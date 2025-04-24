import React, { useEffect } from 'react';
import axios from 'axios';
import "../App.css";




function Update() {
    useEffect(() => {
	//call server api to trigger update
        axios.get('http://localhost:5000/update')
            .then(response => {
                console.log("Success forcing database update...");
            })
            .catch(error => {
                console.error("Error forcing db update.");
            });
    }, []);



    return (
	<div className="blue" style = {{ height: '100vh', overflow: 'scroll' }}>
		<h1>Triggered database update, check logs to see if it was succesful.</h1>
	</div>
    );
}

export default Update

