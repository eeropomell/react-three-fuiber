import React, { forwardRef, Suspense, useEffect, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { OrbitControls, shaderMaterial } from '@react-three/drei'; // Optional: for camera control
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ShaderMaterial } from 'three';
import * as THREE from "three";
import { useRef } from 'react';
import { GammaCorrectionEffect } from './GammaCorrection';
import { usePause } from '../../Context/PauseContext';
import { useState } from 'react';
import ParameterMenu from '../UI/ParameterMenu';
import PresetsMenu from '../UI/PresetsMenu';

const degreesToRadians = degrees => degrees * (Math.PI / 180);

// Define a CameraLogger component
const CameraLogger = () => {
  const { camera } = useThree(); // Access the camera from the Three.js context
  const cameraRef = useRef(camera);

  // Update the cameraRef when the camera changes
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'w' || event.key === 'W') {
        console.log('Camera Object:', cameraRef.current);
      }
    };

    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};

function TunnelActual({ params }) {
  const gltf = useLoader(GLTFLoader, '/assets/models/tunnel6.glb')

  const set = useThree(s => s.set);
  const get = useThree(s => s.get);
  const { isPaused } = usePause();



  const vertexShader = `
  varying vec2 vUv;
  uniform float time;
  uniform float turnFrequency;
  uniform float turnSpeed;
  uniform float turnMagnitude;
  uniform float turnDirection;



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


    float n1 = turnFrequency*(2.*M_PI);
    float n2 = n1 * (1.-uv.y);

    float n3 = time*turnSpeed + n2;

    float n4 = cos(n3);


    float n4sin = sin(n3);

    float n5 = n4 * sin((uv.y)*M_PI) * turnMagnitude;

    float n5sin = n4sin *  sin((uv.y)*M_PI) * turnMagnitude;
    
    // 0 = horizontal
    // 1 = vertical
    // 2 = both
    // 3 = none
    if (turnDirection == 0.0) {
      pos_ += vec3(n5sin,0,0);
    } else if (turnDirection == 1.0) {
      pos_ += vec3(0,0,n5sin);
    } else if (turnDirection == 3.0) {
      pos_ += vec3(0,0,0);
    } else {
      pos_ += vec3(n5,0,n5sin);//step(.2,1. - uv.y);
    }
    //pos_ += vec3(n5sin,0,n5sin);//step(.2,1. - uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_, 1.0);
    }
`;


  const fragmentShader = `
  
  varying vec2 vUv;
  uniform float time;
  uniform float delta;

  uniform float gridScrollSpeed;
  uniform float gridScale;

  void main() {
      float scrollSpeed = gridScrollSpeed;
      vec2 uv = vUv + vec2(0.0,time*scrollSpeed);
      // Time varying pixel color
      float scale = gridScale;
      
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
      delta: { value: 0.0 },
      ...Object.keys(params).reduce((acc, key) => {
        acc[key] = { value: 0.0 };
        return acc;
      }, {}),
    },
  });


  const cylinderRef = useRef(null);

  useEffect(() => {
    console.log(gltf.cameras);

    const euler = new THREE.Euler(
      180, // Rotation around X axis
      -0,   // Rotation around Y axis
      degreesToRadians(180),   // Rotation around Z axis
      'XYZ'                  // Rotation order
    );

    const quaternion = new THREE.Quaternion().setFromEuler(euler);


    gltf.cameras[0].setFocalLength(15);
    // gltf.cameras[0].rotation.x = degreesToRadians(180);
    // gltf.cameras[0].rotation.y = degreesToRadians(-180);
    gltf.cameras[0].applyQuaternion(quaternion);
    set({ camera: gltf.cameras[0] });

    const camera2 = get().camera;
    camera2.applyQuaternion(quaternion);

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
    const originalScale = cylinder.scale.clone();
    cylinder.scale.set(cylinder.scale.x * scaleMult, cylinder.scale.y * scaleMult, cylinder.scale.z * scaleMult);

    // Cleanup function
    return () => {
      // Dispose of custom shader material
      if (customShaderMaterial) {
        customShaderMaterial.dispose();
      }

      cylinder.scale.set(originalScale.x, originalScale.y, originalScale.z);

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
    if (!isPaused) {
      customShaderMaterial.uniforms.time.value = state.clock.getElapsedTime();
    }

    customShaderMaterial.uniforms.turnSpeed.value = params.turnSpeed.value;
    customShaderMaterial.uniforms.turnFrequency.value = params.turnFrequency.value;
    customShaderMaterial.uniforms.turnMagnitude.value = params.turnMagnitude.value;
    customShaderMaterial.uniforms.gridScale.value = params.gridScale.value;
    customShaderMaterial.uniforms.gridScrollSpeed.value = params.gridScrollSpeed.value;
    customShaderMaterial.uniforms.turnDirection.value = params.turnDirection.value;

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

const Tunnel_ = ({ params }) => {
  return (
    <Canvas style={{
      backgroundColor: "#162E5D",
      width: '100vw', height: '100vh', display: 'block'
    }}>


      <TunnelActual params={params} />

      <EffectComposer>
        <GammaCorrectionEffect />
        <Bloom
          mipmapBlur={true}
          kernelSize={500}
          luminanceThreshold={.3}
          luminanceSmoothing={.05}
          intensity={5}
        />

        <CameraLogger />

      </EffectComposer>
    </Canvas>
  )
}

const Tunnel = forwardRef((props,ref) => {


 
  const showUI = props.showUI;
  const searchParams = props.searchParams;

  useImperativeHandle(ref, () => ({
    getParameters() {
      return params;
    }
  }))

  const [params, setParams] = useState({
    // 0: horizontal turns
    // 1: vertical turns
    // 2: both
    // 3: none
    "turnMagnitude": {
      value: 15,
    },
    "turnFrequency": {
      value: 3
    },
    "turnDirection": {
      value: 0,
      text: "0 = horizontal, 1 = vertical, 2 = both, 3 = none"
    },

    "gridScale": {
      value: 25
    },

    "gridScrollSpeed": {
      value: -.25
    },

    "turnSpeed": {
      value: 3
    }

  });

  useEffect(() => {
    // Initialize a new object to store the updated params
    const updatedParams = { ...params };
  
    // Iterate over each key in the `params` state
    for (const key in updatedParams) {
      if (updatedParams.hasOwnProperty(key)) {
        // Check if the searchParams contains the key
        const searchParamValue = searchParams.get(key);
  
        if (searchParamValue !== null) {
          // Parse the value to a number (assuming all values are numbers; adjust if needed)
          const parsedValue = parseFloat(searchParamValue);
  
          // Update the params with the parsed value
          updatedParams[key] = {
            ...updatedParams[key],
            value: isNaN(parsedValue) ? updatedParams[key].value : parsedValue
          };
        }
      }
    }
  
    // Update the state with the new params
    setParams(updatedParams);
  
  }, [searchParams]); // Dependency array includes `searchParams` to run the effect when it changes
  

  const presets = {
    "Slow Straight": {
      turnMagnitude: 0,
      turnFrequency: 2,
      turnDirection: 0,
      gridScale: 10,
      gridScrollSpeed: -.1,
      turnSpeed: 2
    },
    "Forward Travel": {
      turnMagnitude: 15,
      turnFrequency: 3,
      turnDirection: 0,
      gridScale: 25,
      gridScrollSpeed: -.25,
      turnSpeed: 3
    },
    "Slow Backwards": {
      turnMagnitude: 35,
      turnFrequency: -2,
      turnDirection: 0,
      gridScale: 70,
      gridScrollSpeed: .05,
      turnSpeed: 1
    },
    "Slow Spiral": {
      turnMagnitude: 7,
      turnFrequency: -3,
      turnDirection: 2,
      gridScale: 25,
      gridScrollSpeed: -.02,
      turnSpeed: .5
    },
    "170BPM Forward Travel": {
      turnMagnitude: 20,
      turnFrequency: 3,
      turnDirection: 0,
      gridScale: 25,
      gridScrollSpeed: -1.02,
      turnSpeed: 8
    },
    "INSANE": {
      turnMagnitude: 1000000000000000,
      turnFrequency: 0,
      turnDirection: 2,
      gridScale: 20,
      gridScrollSpeed: 1,
      turnSpeed: .1
    }
  };

  const applyPresetToParams = (presetKey) => {
    const preset = presets[presetKey];

    // Update params while preserving 'text' properties
    setParams(prevParams => {
      return {
        ...prevParams, // Preserve existing params
        ...Object.keys(preset).reduce((acc, key) => {
          if (prevParams[key]) {
            acc[key] = {
              value: preset[key], // Update value from preset
              text: prevParams[key].text // Preserve existing text
            };
          } else {
            // If the key doesn't exist in prevParams, just set the value
            acc[key] = { value: preset[key] };
          }
          return acc;
        }, {})
      };
    });
  }


  return (
    <>
    
    {showUI ? <>
      <ParameterMenu params={params} setParams={setParams} />

<PresetsMenu presets={presets} setParams={setParams} marginTop={500} />
    </>: null}



      <Tunnel_ params={params} />



    </>



  );
});

export default Tunnel;
