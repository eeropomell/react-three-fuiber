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




function Scene() {
    const gltf = useLoader(GLTFLoader, '/tunnel2.glb')

    const set = useThree(s => s.set);

    useEffect(() => {
        console.log(gltf.cameras);
        gltf.cameras[0].setFocalLength(22);
        set({camera: gltf.cameras[0]});
        

        const cylinder = gltf.scene.getObjectByName("Cylinder");
       // console.log("C",cylinder);
       
        cylinder.material = new MeshStandardMaterial({
            color: "red",
            side: THREE.FrontSide
            
        });
        cylinder.material = customShaderMaterial;
    }, [gltf.scene])

    const vertexShader = `
    varying vec2 vUv;
    uniform float time;


    float f(float t, vec2 uv) {
        return smoothstep(5.,5.5,(1.-uv.y)*t);
    }

    float m(float t, vec2 uv) {
      return sin((1.-uv.y)*t);
    }

    float g(float t,vec2 uv) {
        return sin(3.*t+uv.y*20.);
    }


    void main() {
      vUv = uv;
      vec3 pos_ = position;
      if (vUv.y < .2) {
        pos_ += vec3(10.,0,0);
      }
      pos_ = position;
      float displacementX = f(time*.2,uv)*smoothstep(.01,.2,1. - uv.y);
      pos_ += vec3(displacementX,0,0)*4.;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_, 1.0);
    }
    `;

    const fragmentShader = `
    
    varying vec2 vUv;
    uniform float time;
    uniform float delta;

    void main() {
        float scrollSpeed = -.2;
        vec2 uv = vUv + vec2(0.0,time*scrollSpeed);
        // Time varying pixel color
        float scale = 10.;
        
        float gridPointX = step(float(mod(uv.x * scale, 1.0)), 0.1);
        float gridPointY = step(float(mod(uv.y * scale, 1.0)), 0.1);
        float gridPoint = min(1.0, gridPointX + gridPointY);
    
        // Output to screen
        gl_FragColor = vec4(gridPoint,gridPoint,gridPoint, 1.0);
    
    }


    `;

    useFrame((state,delta) => {
       // console.log(customShaderMaterial.uniforms.iTime);
        customShaderMaterial.uniforms.time.value = state.clock.getElapsedTime();

        customShaderMaterial.uniforms.delta.value = delta;
        if (matRef.current) {
      //      console.log(matRef.current.material);
            //matRef.current.material.uniforms.iTime = state.clock.getElapsedTime();
        }
    })

    const customShaderMaterial = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          // Define uniforms here if needed
          time: {value: 0.0},
          delta: {value: 0.0}
        },
      });

    const matRef = useRef();

    return <primitive object={gltf.scene} ref={matRef}/>
  }
  

const Tunnel = () => {

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
        <Canvas style={{ backgroundColor: "black",
        width: '100vw', height: '100vh', display: 'block' }}>
      
     
        <Scene/>
        <OrbitControls></OrbitControls>
        <EffectComposer>
          <Bloom intensity={1} />
        </EffectComposer>
        </Canvas>
    );
};

export default Tunnel;
