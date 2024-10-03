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
import FPSCounter from '../UI/FPSCounter';
import io from 'socket.io-client';
import { useMemo } from 'react';

const socket = io('http://localhost:4000'); // Update the URL if your server runs on a different port

function easeIn(t) {
  const A = -0.02;
  const B = -4;
  return A + (B - A) * (t*t*t*t*t) // quadratic ease-in
}

// runs every frame during the outro
// frame = 0 is the first frame during the outro
const outroUpdate = (frame,gltf,whiteoutQuad,bloomRef,setBloomIntensity,effectComposerRef,
  cylinder, time,delta,camera
) => {
  console.log("outro update", frame);

  console.log("outro sphere", gltf.scene.getObjectByName("Sphere"))

  console.log("outro BLOOM",bloomRef.current.uniforms.get("intensity").value);

  

//  bloomRef.current.uniforms.set("intensity",{value: 100})

  const x = (frame - 4350)/150;

  const accelerationLength = 4000;

  let gridScroll_ = 0;

  const speedX = 1 - ((accelerationLength - frame) / accelerationLength);

  const speedn_1 = 1 - (1 / accelerationLength);
  
  const multiplier = easeIn(speedn_1) - easeIn(1);

  console.log("outro multiplier", multiplier);

  if (frame <= accelerationLength) {
    console.log("outro easeIn",easeIn(speedX))
    gridScroll_ = easeIn(speedX);

    const prevFrame = frame - 1;
    const speedX_2 = 1 - ((accelerationLength - prevFrame) / accelerationLength);
    console.log("outro slope", easeIn(speedX_2) - easeIn(speedX),
  "t1", speedX, "t2",speedX_2)
  
  } else {
    gridScroll_ = (easeIn(1) - multiplier*(frame - accelerationLength));

    const prevFrame = frame - 1;

    console.log("outro slope", (easeIn(1) - 0.004*(prevFrame - accelerationLength)) - (easeIn(1) - 0.004*(frame - accelerationLength)))
  }
  console.log("outro gridScroll",gridScroll_);
 
  cylinder.material.uniforms.gridScroll.value = gridScroll_;

 // if (frame < 800) {
 //   cylinder.material.uniforms.gridScroll.value = -.2*time.current;
    //camera
  // camera.rotation.z+= .9*delta;
 //// } else {
   // cylinder.material.uniforms.gridScroll.value = -.5*time.current;
 // }

  if (frame === 800) {
    const realFrame = (frame - 100) / 20;
    //setBloomIntensity(50);

   // const v = THREE.MathUtils.clamp(Math.pow(2,5*((realFrame)-1))*100+5,5,500)
    //setBloomIntensity(v);
    //console.log("outro effect",effectComposerRef,v)
    //effectComposerRef.current.render(.1);
   // cylinder.material.uniforms.gridScroll.value = -.5*time.current;
  }
 // setBloomIntensity(THREE.MathUtils.clamp(Math.pow(2,20*(x-1))*100+5,5,100));

  whiteoutQuad.material.opacity = THREE.MathUtils.clamp(Math.pow(2,20*(x-1)),0,1);
  //gltf.cameras[0].setFocalLength(Math.pow(2,2*((100-frame)/100)-1)*20+5);
}

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
       // console.log('Camera Object:', cameraRef.current);
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

function TunnelActual({ params, sceneTime, setSceneTime}) {


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
    // 4 = infinite left turn
    if (turnDirection == 0.0) {
      pos_ += vec3(n5sin,0,0);
      //pos_ += vec3(smoothstep(.05,.3,1. - uv.y)*30.,0,0);
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

  uniform float gridScroll;
  uniform float gridScale;
  

  void main() {
      float scrollSpeed = gridScroll;
      vec2 uv = vUv + vec2(0.0,gridScroll);
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

  const vertexShader2 = `
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


    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_, 1.0);
    }
`;


  const fragmentShader2 = `
  
  varying vec2 vUv;

  uniform sampler2D tex1;
  

  void main() {

      // Output to screen
      gl_FragColor = texture(vec3(.5,.5,.5),1.);
  
  }


  `;



  const gltf = useLoader(GLTFLoader, '/assets/models/earthChipCylinder2.gltf')
 // console.log("GLTF_",gltf);

 

  const sphere = gltf.scene.getObjectByName("Sphere")


  const whiteoutQuad = useMemo(() => {

    return gltf.scene.getObjectByName("Plane");
  }, )

  const time = useRef(0);
  

  const customShaderMaterial = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      // Define uniforms here if needed
      time: { value: time.current },
      delta: { value: 0.0 },
      ...Object.keys(params).reduce((acc, key) => {
        acc[key] = { value: 0.0 };
        return acc;
      }, {}),

    },

  });

  const customShaderMaterial2 = new ShaderMaterial({
    vertexShader2,
    fragmentShader2,
    uniforms: {
      // Define uniforms here if needed
      time: { value: 0.0 },
      delta: { value: 0.0 },
      ...Object.keys(params).reduce((acc, key) => {
        acc[key] = { value: 0.0 };
        return acc;
      }, {}),
      tex1: {
        value: new THREE.TextureLoader().load("/assets/images/earthTex.jpeg")
      }
    },

  });

  console.log("sphere",sphere)
 // sphere.material = customShaderMaterial;


  whiteoutQuad.material = useMemo(() => new MeshStandardMaterial({
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1,
    color: "white",
    side: THREE.BackSide,
    transparent: true,
    opacity: 0
   
  }),[])

    console.log("white",whiteoutQuad.position);
 // const whiteQuadPos = useMemo(() => whiteoutQuad.position.y)

  //whiteoutQuad.position.y -= .3;
  whiteoutQuad.position.set(0,1.563736915588379-1.5,0);



 


  gltf.scene.traverse(child => {
    if (child.material && child.material.name == "black.006") {
      child.material.emissiveIntensity = 100;
    }
  })


  const frameCount = useRef(0);
  const elapsedTime = useRef(0);
  const fps = useRef(0);

  const set = useThree(s => s.set);
  const get = useThree(s => s.get);
  const { isPaused } = usePause();

  gltf.cameras[0].setFocalLength(15);

  set({ camera: gltf.cameras[0] });

  const cylinder = gltf.scene.getObjectByName("Cylinder002");

  cylinder.material = customShaderMaterial;

  const playingOutro = useRef(false);



  const globalFrame = useRef(0);
  const outroFrame = useRef(0);

  const outroTotalFrames = 4500;
  
//  const { time, setTime, timeResetFlag, setTimeResetFlag } = usePause();


  const timeMemo = useMemo(() => time.current,[time]);

 // console.log("TIMEFFS",time);

  useEffect(() => {
    console.log("TIMEFFS",time);
  },[time.current])

  const startOutro = (frame,outroFrameRef) => {
   // setPlayingOutro(true);
 //   setOutroFrame(0);
 outroFrameRef.current = 0;
  }

  const endOutro = () => {
   // setPlayingOutro(false);
  }

  const bloomRef = useRef(null);
  const [bloomIntensity,setBloomIntensity] = useState(5);

  useFrame((state, delta) => {

  

    frameCount.current++;
    elapsedTime.current += delta;


    // Calculate FPS every second
    if (elapsedTime.current >= 1) {
      fps.current = frameCount.current / elapsedTime.current;

      // Log or display the FPS
     //("FPS_:", fps.current);

      // Reset for the next second
      elapsedTime.current = 0;
      frameCount.current = 0;
    }

   // sphere.rotation.y += -.3*delta;


    // console.log(customShaderMaterial.uniforms.iTime);
  //  console.log("my sceneTime", sceneTime);

  //gltf.cameras[0].setFocalLength(Math.sin(state.clock.getElapsedTime())*5+10);

  

      console.log("frame", globalFrame.current)
      const currentGlobalFrame = globalFrame.current + 1; 
      globalFrame.current++;

      if (currentGlobalFrame < 400) {
      //  console.log("outro global", globalFrame);
      //  console.log("outro playing", playingOutro);
        
      //  console.log("outro frame", outroFrame);
  
      }
   
      
      if (currentGlobalFrame == 100) {
        playingOutro.current = true;
      }

      if (playingOutro.current == true) {
        outroUpdate(outroFrame.current++,gltf,whiteoutQuad,bloomRef,setBloomIntensity,effectComposerRef,
          cylinder, time,delta,get().camera
        );
        if (outroFrame.current >= outroTotalFrames) {
          playingOutro.current = false;
        }
      }

      

 

    const globFrame = globalFrame;

    if (!isPaused) {
      time.current += delta;
      customShaderMaterial.uniforms.time.value += delta;
    //  setTime(t => t + delta);
    } 



    // 4+4*smoothstep(0,0.7,sin(x+t))


    const val = .1 * THREE.MathUtils.smoothstep(Math.sin(time * 2), 0, 1);
    // THREE.MathUtils.lerp(0,.001,time);
    // params.gridScroll.value;
  //  console.log("Val", val, Math.sin(time), time);

    /*

    gridScale = sin(t*2)
    gridScale = 4 + 4*smoothstep(0,0.7,sin(t))

    */


    const step = (x, limit) => {
      return x < limit ? 0 : 1;
    };



    customShaderMaterial.uniforms.turnSpeed.value = params.turnSpeed.value;
    try {
      customShaderMaterial.uniforms.turnSpeed.value = new Function("t", "time", ...Object.getOwnPropertyNames(Math),
        ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.turnSpeed.value}`)(time.current, time.current,
          ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
          ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
          step
        );
    } catch (e) {

    }

    try {
      customShaderMaterial.uniforms.turnFrequency.value = new Function("t", "time", ...Object.getOwnPropertyNames(Math),
        ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.turnFrequency.value}`)(time.current, time.current,
          ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
          ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
          step
        );
    } catch (e) {

    }
    try {
      customShaderMaterial.uniforms.turnMagnitude.value = new Function("t", "time", ...Object.getOwnPropertyNames(Math),
        ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.turnMagnitude.value}`)(time.current, time.current,
          ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
          ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
          step
        );
    } catch (e) {

    }


    try {
      customShaderMaterial.uniforms.gridScale.value = new Function("t", "time", ...Object.getOwnPropertyNames(Math),
        ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.gridScale.value}`)(time.current, time.current,
          ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
          ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
          step
        );
    } catch (e) {
      customShaderMaterial.uniforms.gridScale.value = 10;
    }

    const camera3 = get().camera;
    camera3.position.z = Math.sin(time.current*4)*.1

    try {
      if (playingOutro.current == false) {
            customShaderMaterial.uniforms.gridScroll.value = 
      new Function("t", "time", ...Object.getOwnPropertyNames(Math),
      ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.gridScroll.value}`)(time.current, time.current,
        ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
        ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
        step
      );
      }
    } catch (e) {
  //   customShaderMaterial.uniforms.gridScroll.value = -.2*time.current;
    }



    customShaderMaterial.uniforms.turnDirection.value = params.turnDirection.value;
    customShaderMaterial.uniforms.delta.value = delta;


  //  console.log("TIME", state.clock.getElapsedTime())
    if (matRef.current) {
      //      console.log(matRef.current.material);
      //matRef.current.material.uniforms.iTime = state.clock.getElapsedTime();
    }
  })

  const matRef = useRef();
  const effectComposerRef = useRef(null);

  return (
    <>
       <EffectComposer ref={effectComposerRef}>
        <GammaCorrectionEffect />
        <Bloom
        ref={bloomRef}
          mipmapBlur={true}
          kernelSize={500}
          luminanceThreshold={.3}
          luminanceSmoothing={.05}
          intensity={bloomIntensity}
        />
</EffectComposer>
    <primitive object={gltf.scene} ref={matRef} />
    </>
  )
}

const Tunnel_ = ({ params, setSceneTime, sceneTime, showUI }) => {






  return (
    <Canvas style={{
      backgroundColor: "#162E5D",
      width: '100vw', height: '100vh', display: 'block'
    }}>


    
    <Suspense>
    <TunnelActual params={params}/>
    </Suspense>
     

      {showUI ? <FPSCounter /> : null}

   
        <CameraLogger />

 
    </Canvas>
  )
}

const Tunnel = forwardRef((props, ref) => {



  const [message, setMessage] = useState(''); // General message state

  useEffect(() => {
    // Create a WebSocket connection


    socket.on("msg_setParams", (msg) => {
        //console.log("MSG",msg);

        if (msg == null) {
          return;
        }

        const messageJSON = JSON.parse(msg);

        // Initialize a new object to store the updated params
        const updatedParams = { ...params };
  
        // Iterate over each key in the `params` state
        for (const key in messageJSON) {
          if (updatedParams.hasOwnProperty(key)) {
            // Check if the searchParams contains the key
  
            // Parse the value to a number (assuming all values are numbers; adjust if needed)
  
            // Update the params with the parsed value
            updatedParams[key] = {
              ...updatedParams[key],
              value: messageJSON[key]
            };
  
          }
        }
  
        // Update the state with the new params
        setParams(updatedParams);
    })  

   /* // Handle incoming messages
    websocket.onmessage = (event) => {
      console.log('Message from server:', event.data);

      if (event.data == null) {
        return;
      }

      const messageJSON = JSON.parse(event.data);

      // Initialize a new object to store the updated params
      const updatedParams = { ...params };

      // Iterate over each key in the `params` state
      for (const key in messageJSON) {
        if (updatedParams.hasOwnProperty(key)) {
          // Check if the searchParams contains the key

          // Parse the value to a number (assuming all values are numbers; adjust if needed)
          

          // Update the params with the parsed value
          updatedParams[key] = {
            ...updatedParams[key],
            value: messageJSON[key]
          };

        }
      }

      // Update the state with the new params
      setParams(updatedParams);


    };*/
  
    // Set the WebSocket instance to state
    

    // Clean up the WebSocket connection on component unmount
    return () => {
      socket.off("msg_setParams");
    };
  }, []);


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

    "gridScroll": {
      value: "-0.25*t"
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
      gridScroll: "-.1*t",
      turnSpeed: 2
    },
    "Forward Travel": {
      turnMagnitude: 15,
      turnFrequency: 3,
      turnDirection: 0,
      gridScale: 25,
      gridScroll: "-.25*t",
      turnSpeed: 3
    },
    "Slow Spiral": {
      turnMagnitude: 7,
      turnFrequency: -3,
      turnDirection: 2,
      gridScale: 25,
      gridScroll: "-.02*t",
      turnSpeed: .5
    },
    "170BPM Forward Travel": {
      turnMagnitude: 20,
      turnFrequency: 3,
      turnDirection: 0,
      gridScale: 25,
      gridScroll: "-1.02*t",
      turnSpeed: 8
    },
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

  const [sceneTime, setSceneTime] = useState(1);


  const playOutro = () => {

  }


  return (
    <>


 

      {showUI ? <>
        <ParameterMenu params={params} setParams={setParams} sceneTime={sceneTime} setSceneTime={setSceneTime} />

        <PresetsMenu presets={presets} setParams={setParams} marginTop={600} />


      </> : null}



      <Tunnel_ params={params} setSceneTime={setSceneTime} sceneTime={sceneTime} showUI={showUI} />



    </>



  );
});

export default Tunnel;
