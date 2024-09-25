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
import { GammaCorrectionEffect } from '../Three/GammaCorrection';


function Scene() {
  const gltf = useLoader(GLTFLoader, '/tunnel5.glb')

  const set = useThree(s => s.set);

  const vertexShader = `
  varying vec2 vUv;
  uniform float time;


  #define M_PI 3.1415926535897932384626433832795

  #define M_TWISTFREQUENCY 3.
  #define M_TWISTSPEED 2.
  #define M_TWISTMAGNITUDE 15.

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
    float displacementX = g(time*.2,uv)*smoothstep(.001,.01,1. - uv.y);
  //  pos_ += vec3(displacementX,0,0)*1.;


    float n1 = M_TWISTFREQUENCY*(2.*M_PI);
    float n2 = n1 * (1.-uv.y);

    float n3 = time*M_TWISTSPEED + n2;

    float n4 = cos(n3);


    float n4sin = sin(n3);

    float n5 = n4 * sin((uv.y)*M_PI) * M_TWISTMAGNITUDE;

    float n5sin = n4sin *  sin((uv.y)*M_PI) * M_TWISTMAGNITUDE;
    

    pos_ += vec3(n5sin,0,n5sin);//step(.2,1. - uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_, 1.0);
    }
`;


const fragmentShader = `
  
  varying vec2 vUv;
  uniform float time;
  uniform float delta;

  void main() {
      float scrollSpeed = -.25;
      vec2 uv = vUv + vec2(0.0,time*scrollSpeed);
      // Time varying pixel color
      float scale = 25.;
      
      float gridPointX = step(float(mod(uv.x * scale, 1.0)), 0.1);
      float gridPointY = step(float(mod(uv.y * scale, 1.0)), 0.1);
      float gridPoint = min(1.0, gridPointX + gridPointY);

      vec3 primBlueColor = vec3(0.40784313725490196, 0.7019607843137254, 1);
      vec3 primBlueColor2 = vec3(0.20784313725490197, 0.38823529411764707, 0.7647058823529411);
      vec3 primBlueColor3 = vec3(0.30196078431372547, 0.5254901960784314, 1.)*.5 + vec3(0,0,1.);

    

      vec3 col = primBlueColor3*gridPoint;
      float alpha = 1.0 * smoothstep(1.,1.,gridPoint);

      // Output to screen
      gl_FragColor = vec4(col, alpha);
  
  }


  `;



  const customShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      // Define uniforms here if needed
      time: { value: 0.0 },
      delta: { value: 0.0 }
    },
  });


  const cylinderRef = useRef(null);

  useEffect(() => {
    console.log(gltf.cameras);
    gltf.cameras[0].setFocalLength(15);
    set({ camera: gltf.cameras[0] });

    const cylinder = gltf.scene.getObjectByName("Cylinder");
    // console.log("C",cylinder);

    cylinder.material = new MeshStandardMaterial({
      color: "red",
      side: THREE.FrontSide

    });
    cylinder.material = customShaderMaterial;

    cylinder.position.y -= 0.0;
    console.log("SCALE", cylinder.scale);
    const scaleMult = 15;
    cylinder.scale.set(cylinder.scale.x*scaleMult,cylinder.scale.y*scaleMult,cylinder.scale.z*scaleMult);

    // Cleanup function
    return () => {
      // Dispose of custom shader material
      if (customShaderMaterial) {
        customShaderMaterial.dispose();
      }

      // Dispose of any GLTF resources
      if (gltf.scene) {
        gltf.scene.traverse((child) => {
          if (child.material) {
            child.material.dispose();
          }
          if (child.geometry) {
            child.geometry.dispose();
          }
        });
      }
    };
  }, [gltf.scene, set, customShaderMaterial])



  useFrame((state, delta) => {
    // console.log(customShaderMaterial.uniforms.iTime);
    customShaderMaterial.uniforms.time.value = state.clock.getElapsedTime();

    customShaderMaterial.uniforms.delta.value = delta;
    console.log("TIME", state.clock.getElapsedTime())
    if (matRef.current) {
      //      console.log(matRef.current.material);
      //matRef.current.material.uniforms.iTime = state.clock.getElapsedTime();
    }
  })



  const matRef = useRef();

  return <primitive object={gltf.scene} ref={matRef} />
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
    <Canvas style={{
      backgroundColor: "#162E5D",
      width: '100vw', height: '100vh', display: 'block'
    }}>


      <Scene />
      <OrbitControls></OrbitControls>
      <EffectComposer>
        <GammaCorrectionEffect/>
      <Bloom
          mipmapBlur={true}
          kernelSize={500}
          luminanceThreshold={.3}
          luminanceSmoothing={.05}
          intensity={5}
        />
 
      </EffectComposer>
    </Canvas>
  );
};

export default Tunnel;
