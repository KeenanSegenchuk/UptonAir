import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';
import {ContextProvider} from "./AppContext";

function App() {
    return (
	<div className = "App-container"> 
	    <ContextProvider>
            	<Router>
                    <Routes>
                    	<Route path="/" element={<Home />} />
                    	<Route path="/data" element={<Data />} />
		    	<Route path="/about" element={<About />} />
                    </Routes>
            	</Router>
	    </ContextProvider>
	</div>
    );
}

export default App;