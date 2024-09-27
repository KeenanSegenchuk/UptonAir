import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/data" element={<Data />} />
		<Route path="/about" element={<About />} />
            </Routes>
        </Router>
    );
}

export default App;