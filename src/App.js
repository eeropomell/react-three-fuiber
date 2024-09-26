import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Tunnel from './Backgrounds/Tunnel';
import Chip1 from './Backgrounds/Chip1';
import { useState } from 'react';
import Timer from './Overlays/Timer';
import Credits from './Overlays/Credits';
import Scene from './Scene';

const App = () => {




  const [currentOverlay, setCurrentOverlay] = useState(null);

    // Function to show Timer overlay
    const showTimer = () => setCurrentOverlay(s => s == 'timer' ? null : "timer");

    // Function to show Credits overlay
    const showCredits = () => setCurrentOverlay(
      s => s == 'credits' ? null : "credits");
  
    // Function to hide overlay
    const hideOverlay = () => setCurrentOverlay(null);

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
          <div style={{color: "red"}}>Overlays</div>
     
            
            <button style={{ backgroundColor: 'lightgrey' }}
            onClick={showTimer}>Timer</button>
         

    
            
            <button style={{ backgroundColor: 'lightgrey' }}
            onClick={showCredits}>Credits</button>
        
         
          {/* Add more links here as needed */}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 140,
            left: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1
          }}
        >
          <div style={{color: "red"}}>Backgrounds</div>
          <Link
            to="/tunnel"
            style={{ display: 'block', marginBottom: '5px', textDecoration: 'none' }}
          >

            
            <button style={{ backgroundColor: 'lightgrey' }}>Tunnel</button>
          </Link>

          <Link
            to="/chip1"
            style={{ display: 'block', marginBottom: '5px', textDecoration: 'none' }}
          >

            
            <button style={{ backgroundColor: 'lightgrey' }}>Chip1</button>
          </Link>
          <Link
            to="/other"
            style={{ display: 'block', marginBottom: '5px', textDecoration: 'none' }}
          >
            <button style={{ backgroundColor: 'lightgrey' }}>Other</button>
          </Link>
          {/* Add more links here as needed */}
        </div>


        <div style={{ flex: 1 }}>
        {currentOverlay === 'timer' && <Timer />}
        {currentOverlay === 'credits' && <Credits />}
      </div>

        <div style={{ flex: 1}}>
          <Routes>


            <Route path="/scene/*" element={<Scene/>}/>

            <Route path="/tunnel" element={<Tunnel />} />
           
            <Route path="/" element={<div>Select a page</div>} />

            <Route path="/chip1" element={<Chip1/>}/>

       
            {/* Add more routes here as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
