import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ContextProvider } from "./AppContext";

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Home'));
const Landing = lazy(() => import('./pages/Landing'));
const Alerts = lazy(() => import('./pages/Alerts'));
//const Test = lazy(() => import('./pages/Test'));

function App() {

    //set tab title
    useEffect(() => {
      document.title = "Upton Air";
    }, []);


    return (
        <div className="App-container">
            <ContextProvider>
                <Router>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Landing />} />
			    <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/alerts" element={<Alerts />} />
                        </Routes>
                    </Suspense>
                </Router>
            </ContextProvider>
        </div>
    );
}

export default App;