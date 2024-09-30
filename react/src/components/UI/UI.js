import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Tunnel from '../ThreeJS/Tunnel';
import { useState } from 'react';
import Timer from '../Overlays/Timer';
import Credits from '../Overlays/Credits';
import Scene from '../Scene';
import Facecam from '../Overlays/Facecam';
import "../../App.css";
import Interview1 from '../../Scenes/Interview1/Interview1';
import { PauseProvider } from '../../Context/PauseContext';
import PlayPauseButton from './PlayPauseButton';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import FPSCounter from './FPSCounter';


const UI = ({handleCopyURLtoClipboard,handleTimerClick}) => {

    const { pathname } = useLocation();
    const { '*': query } = useParams(); // Catch-all route parameter
    const [searchParams,setSearchParams] = useSearchParams();
    console.log(searchParams);


    const navigate = useNavigate();

  const handleCopyUrlButton = () => {

    // we need tunnel.getParameters()
    handleCopyURLtoClipboard();
  }

// set background=tunnel and rerender
  const handleClick = (bg) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("background", bg);
    navigate(`${pathname}?${newSearchParams.toString()}`, { replace: true });
  } 

  return (
    <>


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
        
            
            <button style={{ backgroundColor: 'lightgrey' }}
            onClick={() => handleClick("tunnel")}>Tunnel</button>
       
 
            <button style={{ backgroundColor: 'lightgrey' }}
             onClick={() => handleClick("chip1")}>Chip1</button>
     
   
            <button style={{ backgroundColor: 'lightgrey' }} onClick={() => handleClick("chip2")}>Chip2</button>
       
          {/* Add more links here as needed */}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 260,
            left: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1
          }}
        >
          <div style={{color: "red"}}>Overlays</div>
        
            
            <button style={{ backgroundColor: 'lightgrey' }} 
            onClick={handleTimerClick}>Timer1</button>
      
 

   
  
       
          {/* Add more links here as needed */}
        </div>

            <div
          style={{
            position: 'absolute',
            top: 430,
            left: 0,
            backgroundColor: 'rgba(128, 128, 128, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1
          }}
        >

            <h3>ESC: toggle UI</h3>

<PlayPauseButton/>



<button onClick={handleCopyUrlButton}>Copy URL</button>

        </div>
    </>
  );
};

export default UI;
