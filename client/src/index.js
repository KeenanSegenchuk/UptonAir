import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// create a portal root if it doesn't exist
let portalRoot = document.getElementById('portal-root');
if (!portalRoot) {
  portalRoot = document.createElement('div');
  portalRoot.id = 'portal-root';
  Object.assign(portalRoot.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 9999,
    pointerEvents: 'none',
  });
  document.body.appendChild(portalRoot);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
