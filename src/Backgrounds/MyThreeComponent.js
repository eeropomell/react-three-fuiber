import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const MyThreeComponent = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      // Update scene
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // Cleanup
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default MyThreeComponent;
