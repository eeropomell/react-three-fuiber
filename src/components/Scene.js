import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Tunnel from './ThreeJS/Tunnel'; // Background component example
import UI from './UI/UI';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';

const Scene = () => {
  const { pathname } = useLocation();
  const { '*': query } = useParams(); // Catch-all route parameter
  const [searchParams, setSearchParams] = useSearchParams();
  console.log(searchParams);

  const backgroundRef = useRef();

  const navigate = useNavigate();

  // Extract parameters from the pathname after '/scene/'

  const bg = searchParams.get("background");
  console.log("s", searchParams);



  const [showUI, setShowUI] = useState(searchParams.get("ui") === "true");


  const handleCopyURLtoClipboard = () => {
    const copiedSearchParams = getCurrentSceneAsSearchParameters(false);

    console.log("CCC",copiedSearchParams);
    // Construct the full URL
const baseURL = window.location.origin + window.location.pathname; // Base URL (e.g., http://localhost:3000/scene)
const fullURL = `${baseURL}?${copiedSearchParams.toString()}`; // Append parameters

console.log("Full URL:", fullURL);

// Copy the URL to the clipboard
navigator.clipboard.writeText(fullURL)
  .then(() => {
    console.log('URL copied to clipboard');
  })
  .catch(err => {
    console.error('Failed to copy URL to clipboard', err);
  });
  }
  /*

  - This is invoked by the copyUrl button in <UI/>

  - set ui=false
  - keep background=
  - set ... = background.GetParameters();
  */
  const getCurrentSceneAsSearchParameters = (showUI=false) => {

    const copiedSearchParams = new URLSearchParams();

    copiedSearchParams.set("ui", showUI ? "true" : "false");
    copiedSearchParams.set("background", searchParams.get("background"));

    if (backgroundRef.current) {
      const backgroundParameters = backgroundRef.current.getParameters();
      console.log("BG PARAMETERS", backgroundParameters);

      // Add dynamic parameters from the state
      for (const [key, valueObj] of Object.entries(backgroundParameters)) {
        if (valueObj.value !== undefined) {
          copiedSearchParams.set(key, valueObj.value);
        }
      }

    }

    return copiedSearchParams;



  }

  useEffect(() => {
    console.log("UI", showUI);


    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Toggle the 'ui' parameter between 'true' and 'false'
        

        // we need to save the parameters from Background

        const newSearchParams = getCurrentSceneAsSearchParameters(searchParams.get("ui") === "false");

        console.log("NEWSEARCHPARAMS", newSearchParams);

        // Use navigate to update the URL with the new query params
        navigate(`${pathname}?${newSearchParams.toString()}`, { replace: true });

        setSearchParams(newSearchParams);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, pathname, searchParams, setSearchParams])

  useEffect(() => {
    // Update local state when searchParams change
    setShowUI(searchParams.get("ui") === "true");
  }, [searchParams]);

  // Render background component based on URL parameter
  const renderBackground = () => {
    switch (bg) {
      case 'tunnel':
        return <Tunnel showUI={showUI} ref={backgroundRef} searchParams={searchParams}/>;
      // Add cases for other backgrounds if needed
      default:
        return <div>No background specified</div>;
    }
  };


  return (
    <div>
      {renderBackground()}

      {showUI ? <UI handleCopyURLtoClipboard={handleCopyURLtoClipboard} /> : null}

    </div>
  );
};

export default Scene;
