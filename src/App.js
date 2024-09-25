import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Tunnel from './pages/Tunnel';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1
          }}
        >
          <Link
            to="/tunnel"
            style={{ display: 'block', marginBottom: '5px', textDecoration: 'none' }}
          >
            <button style={{ backgroundColor: 'lightgrey' }}>Tunnel</button>
          </Link>
          <Link
            to="/other"
            style={{ display: 'block', marginBottom: '5px', textDecoration: 'none' }}
          >
            <button style={{ backgroundColor: 'lightgrey' }}>Other</button>
          </Link>
          {/* Add more links here as needed */}
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/tunnel" element={<Tunnel />} />
           
            <Route path="/" element={<div>Select a page</div>} />
            {/* Add more routes here as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
