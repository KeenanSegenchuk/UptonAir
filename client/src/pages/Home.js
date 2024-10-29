import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Map from "../components/Map";
import Banner from "../components/Banner";
import SensorInfo from "../components/SensorInfo";
import { Link } from 'react-router-dom'
// import Button from '@material-ui/core/Button';


function Home() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const infoRef = useRef(null);

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

    //calculate avg for banner
    var count = 0;
    var total = 0;
    const averages = data.map(sensor => sensor.avg);
    averages.forEach(avg => {
	total = total + avg;
	count = count + 1;
    })

    //define float css
    const sinkBox = {
	width: "100%",
	padding: "10px",
    };
    const floatBox = {
	padding: "10px",
	border: "1px solid #000",
    };
    const floatContainer = {
	display: "flex", // Use flexbox for layout
	justifyContent: "space-around", // Optional, for spacing
    };

    return (
        
	<div>
         <div>
            <p>
              This is the home page. Click on the button below to learn more about us, or contact us if you want to learn more!
            </p>
            <Link to="/about"><button>
              About Us
            </button>
            </Link>
          </div>

          <div>
            <Link to="/contact"><button>
              Contact Us
            </button>
            </Link>
          </div>
            <h1 style = {{textAlign: "center",}}>Upton Air</h1>
            <div style = {floatContainer}>
                <Map style = {floatBox} buttons={data} reff={infoRef} />
                <div style={{ width: "90%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        	    <Banner style={floatBox} avg={Math.round(100 * total / count) / 100} />
       		    <div id="infoBox" ref={infoRef} style={sinkBox}></div>
      		</div> 
            </div>
            
           
	</div>
    );
}

export default Home;

