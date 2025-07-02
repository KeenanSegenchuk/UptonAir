import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ContextProvider } from "./AppContext";

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
//const Home2 = lazy(() => import('./pages/Home2'));
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
                            <Route path="/" element={<Home />} />
                            <Route path="/alerts" element={<Alerts />} />
                        </Routes>
                    </Suspense>
                </Router>
            </ContextProvider>
        </div>
    );
}

export default App;