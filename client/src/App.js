import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import Data from './pages/Data';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/data" element={<Data />} />
		<Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
            </Routes>
        </Router>
    );
}

export default App;