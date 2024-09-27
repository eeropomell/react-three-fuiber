// src/scenes/Interview1/Interview1.js
import React from 'react';
import './Interview1.css'; // Import scene-specific styles
import Facecam from '../../components/Overlays/Facecam';


const Interview1 = () => {
  return (
    <div className="interview1-scene">
      {/* Scene content */}
      
      <Facecam left={150} top={70} width={800}/>

      <Facecam left={150} top={500} width={800}/>

      <Facecam left={1000} top={250} width={700}/>
    </div>
  );
};

export default Interview1;
