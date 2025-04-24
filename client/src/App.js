import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Test from './pages/Test';
import Update from './pages/Update';
import {ContextProvider} from "./AppContext";

function App() {
    return (
	<div className = "App-container"> 
	    <ContextProvider>
            	<Router>
                    <Routes>
                    	<Route path="/" element={<Home />} />
                    	<Route path="/alerts" element={<Alerts />} />
			<Route path="/test" element={<Test />} />
			<Route path="/update" element={<Update />} />
                    </Routes>
            	</Router>
	    </ContextProvider>
	</div>
    );
}

export default App;