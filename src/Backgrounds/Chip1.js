import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { OrbitControls, shaderMaterial } from '@react-three/drei'; // Optional: for camera control
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ShaderMaterial } from 'three';
import * as THREE from "three";

import { useRef } from 'react';




const Chip1 = () => {

    // Load the grid texture
    const gridTexture = useLoader(TextureLoader, 'emissionGrid.png');

    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    const fragmentShader = `
    
    varying vec2 vUv;
    void main() {
        vec2 uv = vUv;
        // Time varying pixel color
        float scale = 10.;
        
        float gridPointX = step(float(mod(uv.x * scale, 1.0)), 0.1);
        float gridPointY = step(float(mod(uv.y * scale, 1.0)), 0.1);
        float gridPoint = min(1.0, gridPointX + gridPointY);
    
        // Output to screen
        gl_FragColor = vec4(gridPoint, gridPoint, gridPoint, 1.0);
    
    }


    `;

    return (
        <Canvas style={{ 
        width: '100vw', height: '100vh', display: 'block' }}>
      
        <mesh>
            <boxGeometry/>
            <meshStandardMaterial color="orange"/>
        </mesh>
     
        <OrbitControls></OrbitControls>
    
        </Canvas>
    );
};

export default Chip1;
