import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Tunnel from './components/ThreeJS/Tunnel';
import { useState } from 'react';
import Timer from './components/Overlays/Timer';
import Credits from './components/Overlays/Credits';
import Scene from './components/Scene';
import Facecam from './components/Overlays/Facecam';
import "./App.css";
import Interview1 from './Scenes/Interview1/Interview1';
import { PauseProvider } from './Context/PauseContext';
import { useEffect } from 'react';
import { useRef } from 'react';
import PlayPauseButton from './components/UI/PlayPauseButton';


const ModifyUrlOnOpen = () => {

  const navigate = useNavigate();

  useEffect(() => {
    navigate("/scene?background=tunnel&ui=true")
  }, [])

  return (
    <></>
  )

}

const App = () => {

  const [width,setWidth] = useState(0);
  const [height,setHeight] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }, [window.innerHeight, window.innerWidth])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'W' || event.key === 'w') {
        // Your code here
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  },[]);

  const [currentOverlay, setCurrentOverlay] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [currentBackground] = useState("tunnel");

    // Function to show Timer overlay
    const showTimer = () => setCurrentOverlay(s => s == 'timer' ? null : "timer");



    // Function to show Credits overlay
    const showCredits = () => setCurrentOverlay(
      s => s == 'credits' ? null : "credits");
  
    // Function to hide overlay
    const hideOverlay = () => setCurrentOverlay(null);

    const childRef = useRef(null);

    const handleCopyUrlButton = () => {
      if (childRef.current) {
        const childData = childRef.current.getParametricURL();
      }
    }

    const handleClick = () => {
     
    }

  return (
    <PauseProvider>
    <Router>


 
      <div style={{ display: 'flex', height: '100vh' }}>



     

      

        <div style={{ flex: 1}}>
          <Routes>

         
            <Route path="/" element={<ModifyUrlOnOpen/>}/>
            <Route path="/scene/*" element={<Scene/>}/>

            {/* Add more routes here as needed */}
          </Routes>
        </div>




      </div>
     
    </Router>
    </PauseProvider>
  );
};

export default App;
