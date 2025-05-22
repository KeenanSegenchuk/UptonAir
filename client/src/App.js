import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ContextProvider } from "./AppContext";

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Test = lazy(() => import('./pages/Test'));
const Update = lazy(() => import('./pages/Update'));

function App() {
    return (
        <div className="App-container">
            <ContextProvider>
                <Router>
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/test" element={<Test />} />
                            <Route path="/update" element={<Update />} />
                        </Routes>
                    </Suspense>
                </Router>
            </ContextProvider>
        </div>
    );
}

export default App;