import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';

function App() {
    return (
	<div className = "App-container">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/data" element={<Data />} />
		    <Route path="/about" element={<About />} />
                </Routes>
            </Router>
	</div>
    );
}

export default App;