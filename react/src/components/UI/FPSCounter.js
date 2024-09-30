import React, { useState, useEffect } from 'react';
import {useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  let frameCount = 0;
  let lastTime = performance.now();

  useFrame(() => {
    frameCount++;
    const currentTime = performance.now();

    // Calculate FPS every second
    if (currentTime - lastTime >= 1000) {
      setFps(frameCount);
      frameCount = 0;
      lastTime = currentTime;
    }
  });

  return (
    <>
    <Html>
    <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white',fontSize:20 }}>
      FPS: {fps}
    </div>
    </Html>
    </>
 
  );
};


export default FPSCounter;
