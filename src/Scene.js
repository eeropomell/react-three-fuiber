import React from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Tunnel from './Backgrounds/Tunnel'; // Background component example


const Scene = () => {
  const { pathname } = useLocation();
  const { '*': query } = useParams(); // Catch-all route parameter
  const [searchParams] = useSearchParams();
  console.log(searchParams);

  // Extract parameters from the pathname after '/scene/'

  const bg = searchParams.get("background");
  console.log("s",searchParams);

  // Render background component based on URL parameter
  const renderBackground = () => {
    switch (bg) {
      case 'tunnel':
        return <Tunnel />;
      // Add cases for other backgrounds if needed
      default:
        return <div>No background specified</div>;
    }
  };


  return (
    <div>
      {renderBackground()}
    
    </div>
  );
};

export default Scene;
