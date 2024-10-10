import React, { forwardRef, Suspense, useEffect, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshStandardMaterial, TextureLoader } from 'three';
import { OrbitControls, PerspectiveCamera, shaderMaterial } from '@react-three/drei'; // Optional: for camera control
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
import { Texture } from '@react-three/drei';
import { GradientTexture } from '@react-three/drei';
import { GradientType } from '@react-three/drei';
import { CatmullRomLine } from '@react-three/drei';
import { RenderPass } from 'postprocessing';

import { useFBX } from '@react-three/drei';
import FakeGlowMaterial from './FakeGlowMaterial';
import AudioVisualizer from './AudioVisualizer';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import ManyCPUs from './ManyCPUs';

const socket = io('http://localhost:4000'); // Update the URL if your server runs on a different port



function easeIn(t) {
  const A = -0.02;
  const B = -3;
  return A + (B - A) * (t * t * t * t * t) // quadratic ease-in
}

const introUpdate = (frame, gltf, whiteoutQuad, bloomRef, setBloomIntensity, effectComposerRef,
  cylinder, time, delta, camera,
  action, mixerRef, tunnelCamGLB, set, chipLogoPlane, fbxLight,
  introTime, markersRef,audioVizContainer
) => {
  
  // tweak this until the audio is in sync with the animations
  const AUDIO_SYSTEM_LATENCY = .1;
  introTime -= AUDIO_SYSTEM_LATENCY;

  if (introTime >= 1.438 && markersRef.current[1] == false) {
    markersRef.current[1] = true;
    audioVizContainer.position.x += 1;
  } else if (introTime >= 2.877 && markersRef.current[0] == false) {
    markersRef.current[0] = true;
    audioVizContainer.position.x += 1;
  } else if (introTime >= 3.382 && markersRef.current[2] == false) {
    markersRef.current[2] = true;
    audioVizContainer.position.x += 1;
  } else if (introTime >= 7.077 && markersRef.current[3] == false) {
    markersRef.current[3] = true;
    audioVizContainer.position.x += 1;
  }

}

// runs every frame during the outro
// frame = 0 is the first frame during the outro
const outroUpdate = (frame, gltf, whiteoutQuad, bloomRef, setBloomIntensity, effectComposerRef,
  cylinder, time, delta, camera,
  action, mixerRef, tunnelCamGLB, set, chipLogoPlane, fbxLight
) => {

  const x = (frame - 1950) / 50;

  const accelerationLength = 4000;

  let gridScroll_ = 0;

  if (frame == 1) {
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce, 0);
    action.play();
  }

  if (action.isRunning()) {
    mixerRef.current.update(delta)
    //chipLogoPlane.material.uniforms.modeLerp = THREE.MathUtils.clamp(Math.sin(frame),0,1);
   // console.log("fbx time", action.time);
    chipLogoPlane.material.uniforms.modeLerp.value = 1 - THREE.MathUtils.smoothstep(action.time, 1.5, 2)


  } else if (action.paused && action.enabled) {
    // Start of the tunnel scene  

    fbxLight.intensity = 0;

  //  console.log("PAUSED", action);
    action.enabled = false;
    tunnelCamGLB.cameras[0].far = 100000;
    tunnelCamGLB.cameras[0].updateProjectionMatrix();
    // switch to the tunnel travel scene
  //  set({ camera: tunnelCamGLB.cameras[0] })

    cylinder.material.uniforms.turnMagnitude.value = 13;
    cylinder.material.uniforms.turnSpeed.value = -2;
    cylinder.material.uniforms.turnFrequency.value = 1;
  }


  const speedX = 1 - ((accelerationLength - frame) / accelerationLength);

  const speedn_1 = 1 - (1 / accelerationLength);

  const multiplier = easeIn(speedn_1) - easeIn(1);

//  console.log("outro multiplier", multiplier);

  if (frame >= 1000 && frame < 1045) {
    const angle = -1 * (Math.PI / 180);
   /* camera.rotation.z += angle;
    camera.setFocalLength(camera.getFocalLength() -.2);
    camera.updateProjectionMatrix();*/
    cylinder.material.uniforms.turnSpeed.value = -3;
    cylinder.material.uniforms.turnMagnitude.value = 9;
    cylinder.material.uniforms.turnFrequency.value = 1.3; 
  } 



  if (false && frame <= accelerationLength) {
    console.log("outro easeIn", easeIn(speedX))
    gridScroll_ = easeIn(speedX);

    const prevFrame = frame - 1;
    const speedX_2 = 1 - ((accelerationLength - prevFrame) / accelerationLength);
    console.log("outro slope", easeIn(speedX_2) - easeIn(speedX),
      "t1", speedX, "t2", speedX_2)

  } else {
    gridScroll_ = (easeIn(1) - (frame > 1000 ? 1.3*multiplier : multiplier) * (frame - accelerationLength));

    const prevFrame = frame - 1;

   // console.log("outro slope", (easeIn(1) - 0.004 * (prevFrame - accelerationLength)) - (easeIn(1) - 0.004 * (frame - accelerationLength)))
  }
  //console.log("outro gridScroll", gridScroll_);

  cylinder.material.uniforms.gridScroll.value = -gridScroll_;

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

  whiteoutQuad.material.opacity = THREE.MathUtils.clamp(Math.pow(2, 40 * (x - 1)), 0, 1);
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

const TunnelActual = forwardRef((props,ref) => {
  const {params} = props;

  const glowRef = useRef(null);

  console.log("PRESET INT",props)
  const presetInt = parseInt(props.presetInt) || 0;

  const audioVizRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (audioVizRef.current) {
      audioContextRef.current = audioVizRef.current.getAudioContext();
    }
  }, [audioVizRef])


  const [audioVizVisible, setAudioVizVisible] = useState(true);

  useEffect(() => {
    if (audioVizVisible) {
      audioVizContainer.position.set(35.32993087768555, 2.8225765228271484, -20.40278434753418)
    } else {
      audioVizContainer.position.set(35.32993087768555 + 1000, 2.8225765228271484, -20.40278434753418)
    }
  }, [audioVizVisible])

  // Exposing the function to the parent via the ref
  useImperativeHandle(ref, () => ({
      startOutro() {
        playingOutro.current = true;
        outroFrame.current = 0;
        if (audioVizRef.current) {
          audioVizRef.current.setSong_({
            src: "/assets/audio/darkHorseLouderVolume.mp3", name: "Dark Horse Logo"
          });
          audioVizRef.current.setIsPrestream_(true);
          setAudioVizVisible(false);
          audioVizRef.current.setVisible_(false);


        }
        return;
      },
      startIntro() {
        console.log("START INTRO",audioVizRef);
        playingIntro.current = true;
        introFrame.current = true;
      
        if (audioVizRef.current) {
     
          const v = audioVizRef.current.getAudioContext().currentTime;
          console.log("START INTRO TIME",v)
          introStartTime.current = v;
          audioVizRef.current.setIsPrestream_(false);
          audioVizRef.current.setSong_({
            src: "/assets/audio/darkHorseLouderVolume.mp3", name: "Dark Horse Logo"
          });
          audioVizRef.current.setVisible_(false);
          setAudioVizVisible(false);

        }
        setAudioVizVisible(false);

        return;
      }
 
    }));

  const endOutro = () => {
    playingOutro.current = false;
    socket.emit("endOutro");
  }

  const endIntro = () => {
    // we need t ot
    playingIntro.current = false;
    socket.emit("endIntro");
  }

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

  const wireVertexShader = `
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

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

  const wireFragmentShader = `  
  varying vec2 vUv;
  uniform float time;
  uniform float delta;

  uniform float gridScroll;
  uniform float gridScale;

  /* noise and hash from https://www.shadertoy.com/view/4dS3Wd */
float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}
  

  void main() {
      float scrollSpeed = gridScroll;
      vec2 uv = vUv + vec2(0.0,0.0);
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

      float n1 = noise(uv.x*100.);

      col = vec3(step(.3,n1));

      // Output to screen
      gl_FragColor = vec4(col, 1.0);
  
  }
`


  const logoPlaneVertexShader = `
  varying vec2 vUv;

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


  const logoPlaneFragmentShader = `
  
  varying vec2 vUv;
  uniform float time;
  uniform float delta;

  uniform float gridScroll;
  uniform float gridScale;

  uniform float modeLerp;
  uniform sampler2D tex1;
  

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

      vec3 bgBlueColor = vec3(0.08627450980392157, 0.1803921568627451, 0.36470588235294116);
  

      vec3 col = primBlueColor3*gridPoint;
      if (length(col) <= .2) {
        col = bgBlueColor;
      }
      float alpha = 1.0 * smoothstep(1.,1.,gridPoint);

      vec3 finalCol = mix(col,vec3(1.,1.,1.),modeLerp);

      vec2 rotatedUV = vec2(1. - vUv.x,1. - vUv.y);
      vec4 texAlpha = texture(tex1,rotatedUV);

      // Output to screen
      gl_FragColor = vec4(finalCol, texAlpha.z);
  
  }


  `;


  const plane061_vertexShader = `
  varying vec2 vUv;

 
  void main() {
    vUv = uv;
    vec3 pos_ = position;
   
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos_, 1.0);
    }
`;

const plane061_fragmentShader = `
  varying vec2 vUv;
  uniform float time;
  uniform float delta;

  uniform float gridScroll;
  uniform float gridScale;

  uniform float modeLerp;
  uniform sampler2D tex1;
  

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

      vec3 bgBlueColor = vec3(0.08627450980392157, 0.1803921568627451, 0.36470588235294116);
  

      vec3 col = primBlueColor3*gridPoint;
      if (length(col) <= .2) {
        col = bgBlueColor;
      }
      float alpha = 1.0 * smoothstep(1.,1.,gridPoint);

      vec3 finalCol = mix(col,vec3(1.,1.,1.),modeLerp);

      vec2 rotatedUV = vec2(1. - vUv.x,1. - vUv.y);
      vec4 texAlpha = texture(tex1,rotatedUV);

      finalCol = vec3(1.,1.,1.);

      // Output to screen
      gl_FragColor = vec4(finalCol, 1.0);
  
  }
`;

  const tunnelCamGLB = useLoader(GLTFLoader, '/assets/models/tunnelCam.glb')



  const gltf = useLoader(GLTFLoader, '/assets/models/outroCam.glb')

  const blueChipGLTF = useLoader(GLTFLoader, '/assets/models/blueChipSceneThree3.gltf');

  const cylinderNewGLTF = useLoader(GLTFLoader, '/assets/models/cylinderNEW.glb');

  const fbxScene = useFBX("/assets/models/outroScene1.fbx")

  const fbxIntro = useFBX("/assets/models/intro.fbx")


  const gltfCam = useLoader(GLTFLoader,"/assets/models/camAndAudioVizContainer3.glb")

  const spotLightGLTF = useLoader(GLTFLoader,"/assets/models/spotLight.glb")


 // console.log('spot2',spotLightGLTF)

  spotLightGLTF.scene.children[0].intensity = 10;



  fbxScene.scale.set(.01, .01, .01)

  const blueCam = blueChipGLTF.scene.getObjectById(302);

  console.log("BLUECHIPGLTF",blueChipGLTF);

  const cpuBlueRoot = blueChipGLTF.scene.getObjectByName("cpuRootBlue");
  

  if (presetInt === 1) {
    // display a bunch of CPUs that are flying around
  }


 // console.log("gltf blue", blueChipGLTF, blueCam);
 // console.log("fbx scene", fbxScene)

  const intelMaterial = useRef(null);
  const goldMaterial = useRef(null);

  blueChipGLTF.scene.traverse(obj => {
    if (obj.material && obj.material.name == "Gold.002") {
    //  console.log("gold obj",obj);
      obj.material.emissiveIntensity = 100;
      goldMaterial.current = obj.material;
      goldMaterial.current.transparent = true;
    } else if (obj.material && obj.material.name == "Intel") {
      intelMaterial.current = obj.material;
    
    }
    return obj;
  })



  const whiteoutQuad = useMemo(() => {

    return fbxScene.getObjectByName("Plane");
  },)


  const fbxLight = fbxScene.getObjectByName("Sun");
  fbxLight.intensity = 0;

  const time = useRef(0);


  const customShaderMaterial = new ShaderMaterial({
    fragmentShader: wireFragmentShader,
    vertexShader: wireVertexShader,
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

  const logoPlaneMaterial = new ShaderMaterial({
    vertexShader: logoPlaneVertexShader,
    fragmentShader: logoPlaneFragmentShader,
    transparent: true,
    uniforms: {
      // Define uniforms here if needed
      time: { value: 0.0 },
      modeLerp: { value: 1.0 },
      delta: { value: 0.0 },
      ...Object.keys(params).reduce((acc, key) => {
        acc[key] = { value: 0.0 };
        return acc;
      }, {}),
      tex1: {
        value: new THREE.TextureLoader().load("/assets/images/testausLiveLogo.png")
      }
    },

  });


  
  whiteoutQuad.material = useMemo(() => new MeshStandardMaterial({
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 1,
    
      color: "white",
      side: THREE.BackSide,
      transparent: true,
      opacity: 1
     
  }),[])
  
 // console.log("white", whiteoutQuad.position);
  // const whiteQuadPos = useMemo(() => whiteoutQuad.position.y)

  //whiteoutQuad.position.y -= .3;
  whiteoutQuad.position.set(0, 1.563736915588379 - 1.5, 0);






  /*gltf.scene.traverse(child => {
    if (child.material && child.material.name == "black.006") {
      child.material.emissiveIntensity = 0;
    }
  })*/


  const frameCount = useRef(0);
  const elapsedTime = useRef(0);
  const fps = useRef(0);

  const set = useThree(s => s.set);
  const get = useThree(s => s.get);
  const { isPaused } = usePause();

//  console.log('gltf cam',gltfCam);

  gltfCam.scene.traverse(child => {
    if (child.isMesh) {
      child.depthWrite = false;
      child.castShadow = false;
      child.receiveShadow = false;
    }
  })
//  gltfCam.cameras[0].position.x += 20;

  //gltfCam.cameras[0].near = 10;

 // gltfCam.scene.getObjectByName("Plane061").material.opacity = 0;
 // gltfCam.scene.getObjectByName("Plane061").material.transparent= true;

 const plane061 = gltfCam.scene.getObjectByName("Plane061");



 useEffect(() => {
 // plane061.position.x -= 2;
  //plane061.position.y += 2;

  
 }, [])




 const plane061_material = new ShaderMaterial({
  vertexShader: plane061_vertexShader,
  fragmentShader: plane061_fragmentShader,
  opacity: 0, transparent: true
 })

 plane061.material = plane061_material;

 plane061.position.x -= 100;

  const audioVizContainer = gltfCam.scene.getObjectByName("wideCpuRoot");
  audioVizContainer.material = new THREE.MeshBasicMaterial({
    color: "red", side: THREE.DoubleSide, opacity: 0,transparent:true
  })
  //console.log('gltf cam',gltfCam,audioVizContainer);

  //plane061.position.set(audioVizContainer.position.x, audioVizContainer.position.y,audioVizContainer.position.z);
 // audioVizContainer.position.x += 100;

  const cube058 = gltfCam.scene.getObjectByName("Cube058");




 // audioVizContainer.lookAt(40.39,6.018,0.15)
 // audioVizContainer.rotateX(THREE.MathUtils.degToRad(90));
  //audioVizContainer.updateProjectionMatrix();
 gltfCam.cameras[0].near = 1;
 gltfCam.cameras[0].updateProjectionMatrix();

  set({camera: gltfCam.cameras[0]})
 // set({camera:
 //   blueCam
//  })
 // audioVizContainer.lookAt(gltfCam.cameras[0].localToWorld(gltfCam.cameras[0].position))
// console.log('gltf camUUU',gltfCam,audioVizContainer);
  //gltfCam.cameras[0].position.y += 20;

  const mixerRef = useRef(null);


  mixerRef.current = new THREE.AnimationMixer(fbxScene);

  const clips = fbxScene.animations;

  const clip = THREE.AnimationClip.findByName(clips, "cpuRoot|chipFly");
  const action = mixerRef.current.clipAction(clip);
  //console.log("gltf clip", clip, action);
  //gltf.cameras[0].setFocalLength(15);
  gltf.cameras[0].near = .1;
  gltf.cameras[0].updateProjectionMatrix();



 // set({ camera: gltf.cameras[0] });



  const cylinderNewRoot = cylinderNewGLTF.scene.getObjectByName("cylinderRoot");

  cylinderNewRoot.position.x += 10;

  //console.log('new cyl',cylinderNewRoot);

  const cylinderInner = cylinderNewRoot.getObjectByName("CylinderInner");
  const cylinderOuter = cylinderNewRoot.getObjectByName("CylinderOuter");

  cylinderInner.material = customShaderMaterial;

  const gradientTex = new THREE.TextureLoader().load("/gradient.png"); 

  const gradTexRef = useRef(null);

 // console.log("gradient",gradientTex)
 
  cylinderOuter.material = new THREE.MeshBasicMaterial({
    color: "blue", side: THREE.DoubleSide,
    map: gradientTex
  })

  const cylinder = fbxScene.getObjectByName("Cylinder002");



  const chipLogoPlane = fbxScene.getObjectByName("tsryLiveLogoPlane");
  chipLogoPlane.material = logoPlaneMaterial;

// console.log("fbx chip", chipLogoPlane)

  cylinder.material = customShaderMaterial;

  const cloneRef = useRef(null);
  const clonedCylinder = new THREE.Object3D(cylinder.clone());

  clonedCylinder.position.z += 3
  //console.log("CLONE",clonedCylinder);

  cloneRef.current = clonedCylinder;

  const playingOutro = useRef(false);

  const globalFrame = useRef(0);
  const outroFrame = useRef(0);

  const introFrame = useRef(0);
  const introStartTime = useRef(0);

  const markersRef = useRef([
    false,false,false,false,false,false
  ]);

  // prev audioContext.currentTime (last frame during intro update)
  const prevIntroTime = useRef(-1);

  const outroTotalFrames = 2000;
  const introTotalFrames = 1500;

  const playingIntro = useRef(false);

  //  const { time, setTime, timeResetFlag, setTimeResetFlag } = usePause();


  const timeMemo = useMemo(() => time.current, [time]);

  // console.log("TIMEFFS",time);

  useEffect(() => {
   // console.log("TIMEFFS", time);
  }, [time.current])

  const cameraTop = useMemo(() => {
    return new THREE.PerspectiveCamera()
  },[]);

  cameraTop.far = 10000;
  cameraTop.position.set(50,10,100)

 // set({camera: cameraTop})


  const bloomRef = useRef(null);
  const [bloomIntensity, setBloomIntensity] = useState(5);

  const gl = get().gl;
  const scene = get().scene;
  audioVizContainer.lookAt(gltfCam.cameras[0].position)
  audioVizContainer.rotateX(THREE.MathUtils.degToRad(90));
  audioVizContainer.lookAt(gltfCam.cameras[0].position)
  
  audioVizContainer.scale.set(.35,.35,.35)
  const audioVizContainerOGposition = new THREE.Vector3(45.23, 20.403, 2.8226);
  
  audioVizContainer.position.set(35.32993087768555, 2.8225765228271484, -20.40278434753418)


  console.log("AUDIOVIZ",audioVizContainer);
  //audioVizContainer.position.x -= 8;
 // audioVizContainer.position.set(audioVizContainerOGposition.x,audioVizContainerOGposition.y,
 //   audioVizContainerOGposition.z
 // );
 // audioVizContainer.position.set(audioVizContainerOGposition - new THREE.Vector3(10,0,0))

  audioVizContainer.quaternion.copy(gltfCam.cameras[0].quaternion);
 // audioVizContainer.rotateX(THREE.MathUtils.degToRad(90));

  useFrame((state, delta) => {

   // console.log(state.get().camera,"currcam")


  
  //  console.log("REL",gltfCam.cameras[0].localToWorld(gltfCam.cameras[0].position))
   // console.log('rel',gltfCam.cameras[0].worldToLocal(audioVizContainer.localToWorld(audioVizContainer.position)))

  // audioVizContainer.quaternion.copy(gltfCam.cameras[0].quaternion);
   //audioVizContainer.lookAt(gltfCam.cameras[0].position)
 // audioVizContainer.rotateX(THREE.MathUtils.degToRad(1));
  //audioVizContainer.updateProjectionMatrix();
   //effectComposerRef.current.ren

   // state.gl.clear();

  //  state.gl.render(state.scene,cameraTop);

  //  state.gl.clearDepth();

    //gl.setScissorTest(true);

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



  //  console.log("frame", globalFrame.current)
    const currentGlobalFrame = globalFrame.current + 1;
    globalFrame.current++;

  


    if (currentGlobalFrame < 400) {
      //  console.log("outro global", globalFrame);
      //  console.log("outro playing", playingOutro);

      //  console.log("outro frame", outroFrame);

    }
    //mixerRef.current.setTime(.5);
    //    mixerRef.current.update(state.clock.getDelta() * mixerRef.current.timeScale);
    //   console.log("gltf cube", action, clip)
    // cubeGLTF.scene.getObjectByName();

  //  cpuBlueRoot.rotation.z += .01;
   

    if (currentGlobalFrame == 100) {

     // playingOutro.current = true;



    } else if (currentGlobalFrame > 100) {



    }

    if (playingOutro.current == true) {
        outroUpdate(outroFrame.current++, gltf, whiteoutQuad, bloomRef, setBloomIntensity, effectComposerRef,
        cylinder, time, delta, get().camera, action, mixerRef,
        tunnelCamGLB, set, chipLogoPlane,fbxLight
      );
      if (outroFrame.current >= outroTotalFrames) {
        
        endOutro();

      }
    } else if (playingIntro.current == true) {
      let introTime;
     
      if (audioContextRef.current && introStartTime.current) {
        introTime = audioContextRef.current.currentTime - introStartTime.current - (audioContextRef.current.baseLatency +audioContextRef.current.outputLatency);
      }
      console.log("INTRO TIME CURRENT",introTime,audioContextRef,introStartTime);

      if (introTime > 14.2) {
        endIntro();
        introFrame.current = 0;
        playingIntro.current = false;

      } else {
       introUpdate(introFrame.current++, gltf, whiteoutQuad, bloomRef, setBloomIntensity, effectComposerRef,
          cylinder, time, delta, get().camera, action, mixerRef,
          tunnelCamGLB, set, chipLogoPlane,fbxLight, introTime,markersRef, audioVizContainer)

      }
  

    
    }





    const globFrame = globalFrame;

    if (!isPaused) {
      time.current += delta;
      customShaderMaterial.uniforms.time.value += delta;
      logoPlaneMaterial.uniforms.time.value += delta;
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



    if (playingOutro.current == false) {


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
        logoPlaneMaterial.uniforms.gridScale.value =
          customShaderMaterial.uniforms.gridScale.value = new Function("t", "time", ...Object.getOwnPropertyNames(Math),
            ...Object.getOwnPropertyNames(THREE.MathUtils), "step", `return ${params.gridScale.value}`)(time.current, time.current,
              ...Object.getOwnPropertyNames(Math).map(methodName => Math[methodName]),
              ...Object.getOwnPropertyNames(THREE.MathUtils).map(methodName => THREE.MathUtils[methodName]),
              step
            );
      } catch (e) {
        logoPlaneMaterial.uniforms.gridScale.value = customShaderMaterial.uniforms.gridScale.value = 10;
      }
    }
    const camera3 = get().camera;
    //  camera3.position.z = Math.sin(time.current*4)*.1

    try {
      if (playingOutro.current == false) {
        logoPlaneMaterial.uniforms.gridScroll.value = customShaderMaterial.uniforms.gridScroll.value =
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


    if (audioVizRef.current) {
      const audioContext_ = audioVizRef.current.getAudioContext();
      console.log("INTRO AUDIOCONTEXT",audioContext_);
    }
  })

  const matRef = useRef();
  const effectComposerRef = useRef(null);

  return (
    <>
      <EffectComposer ref={effectComposerRef}>
    
        <Bloom
          ref={bloomRef}
          mipmapBlur={true}
          kernelSize={64}
          luminanceThreshold={.3}
          luminanceSmoothing={.05}
          intensity={presetInt == 1 ? .001 : .1}
        />
      </EffectComposer>

      <mesh position={[1.49876296371197, -5.2878687323136795, 1.8413572091384787]}
      ref={glowRef}>
        <sphereGeometry args={[0,50,50]}/>
        <primitive object={new FakeGlowMaterial({
          glowInternalRadius: 5,
          depthTest: false,
          opacity: .2
        })}/>
      </mesh>

      <mesh position={[0,0,0]}>
        <sphereGeometry args={[500,200,200]}/>
        <meshBasicMaterial side={THREE.DoubleSide}
        fog={false} 
        flatShading={false}>
        <GradientTexture
      stops={[0,1]} // As many stops as you want
      colors={['#0B069C', '#03005E']} // Colors need to match the number of stops
      width={1024} // Width of the canvas producing the texture, default = 16
      type={GradientType.Linear
      } // The type of the gradient, default = GradientType.Linear
      ref={gradTexRef}
 />
        </meshBasicMaterial>
      </mesh>
   
   {/*}   
    */}

    <primitive object={fbxScene}/>
      <primitive object={tunnelCamGLB.scene} />
      <primitive object={clonedCylinder} ref={cloneRef}/>
    <primitive object={cylinderNewGLTF.scene}/>

    <primitive object={gltfCam.scene}/>

    <primitive object={blueChipGLTF.scene}/>

   <AudioVisualizer blueChipGLTF={blueChipGLTF}
    gltfCam={gltfCam} plane061={plane061}
    intelMaterial={intelMaterial} goldMaterial={goldMaterial} 
    ref={audioVizRef}
    />
      
    </>
  )
});


const Tunnel_ = forwardRef((props,ref) => {
  const {params, setSceneTime, sceneTime, showUI } = props;

  const tunnelActualRef = useRef(null);

    // Expose the grandchild function via the ref
    useImperativeHandle(ref, () => ({
      startOutro_() {
        if (tunnelActualRef.current)
          tunnelActualRef.current.startOutro();
      },
      startIntro_() {
        console.log("START INTRO_",tunnelActualRef)
        if (tunnelActualRef.current)
          tunnelActualRef.current.startIntro();

      }
    }));

  return (
    <Canvas style={{
      width: '100vw', height: '100vh', display: 'block'
    }}>



      <Suspense>
       <TunnelActual params={params} presetInt={props?.presetInt} ref={tunnelActualRef}/>
      </Suspense>

{/*<OrbitControls></OrbitControls>*/}

      {showUI ? <FPSCounter /> : null}


   


    </Canvas>
  )
}); 




const Tunnel = forwardRef((props, ref) => {



  const [message, setMessage] = useState(''); // General message state

  useEffect(() => {
    
    socket.on("startOutro", () => {
        if (tunnel_Ref.current) {
          tunnel_Ref.current.startOutro_();
        } 
    })

    socket.on("startIntro", () => {
      console.log("START INTRO RECEIVED",tunnel_Ref)
      if (tunnel_Ref.current) {
        tunnel_Ref.current.startIntro_();
      } 
  })



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

  const presetInt = searchParams.get("preset") || 0;

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

  const tunnel_Ref = useRef(null);

  const playOutro = () => {

  }


  return (
    <>




      {showUI ? <>
        <ParameterMenu params={params} setParams={setParams} sceneTime={sceneTime} setSceneTime={setSceneTime} />

        <PresetsMenu presets={presets} setParams={setParams} marginTop={600} />


      </> : null}



      <Tunnel_ ref={tunnel_Ref} params={params} setSceneTime={setSceneTime} sceneTime={sceneTime} showUI={showUI} 
      presetInt={presetInt}/>



    </>



  );
});

export default Tunnel;
