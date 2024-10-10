import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from "three";
import { Mesh } from 'three';
import { useMemo } from 'react';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { Line } from '@react-three/drei';
import { createRef } from 'react';
import { Group } from 'three';
import { Html } from '@react-three/drei';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';


extend({MeshLineGeometry, MeshLineMaterial})

// Audio Visualizer Component
const AudioVisualizer = forwardRef((props,ref) => {

  const {audioUrl,  blueChipGLTF, intelMaterial,goldMaterial,
    gltfCam, plane061, visible} = props;

  const stringRef = useRef();
  const [audioData, setAudioData] = useState([]);

  const analyser = useRef(null);

  const audio = useRef(null);

  const audioContext = useRef(null);

  const dataArray = useRef(null);

  const lineRef = useRef(null);
  const line2Ref = useRef(null);

  const meshRef = useRef(null);
  const mesh2Ref = useRef(null);
  const groupRef = useRef(null);


  useImperativeHandle(ref, () => ({
      setSong_(song) {
        console.log("SETTING INTRO SONG",song);
        setSong(song);
      },
      setIsPrestream_(t) {
        console.log("SETTING PRESTREAM",t,isPreStream);
        setIsPreStream(t);
        isPreStreamRef.current = t;
      },
      getAudioContext() {
        return audioContext.current;
      }
    }));

    // Playlist for pre-stream
    const playlist = [
      {
        src: "/assets/audio/songs/BreakingNewsFlow/audio.mp3",
        name: "Breaking News Flow - Suno AI"
      },
      {
        src: "/assets/audio/songs/BreakingNewsFlow2/audio.mp3",
        name: "Breaking News Flow V2 - Suno AI"
      },
      {
        src: "/assets/audio/songs/Cyberattack/audio.mp3",
        name: "Cyberattack - Suno AI"
      },
      {
        src: "/assets/audio/songs/RunThroughShadows/audio.mp3",
        name: "Run Through Shadows - Suno AI"
      },
      {
        src: "/assets/audio/songs/ElectricChase/audio.mp3",
        name: "Electric Chase - Suno AI"
      },
      {
        src: "/assets/audio/songs/ElectricChase2/audio.mp3",
        name: "Electric Chase V2 - Suno AI"
      },
    ];
  
    // One song to loop during the stream
    const liveStreamSong = {
      src: "/assets/audio/songs/DriftingAt432/audio.mp3",
      name: "Drifting At 432 Hz - Unicorn Heads"
    }

  const sphereGoldMaterial = useRef();

    console.log("AUDIO VIZ")

  // if true, then play songs in `playlist`
  // else loop the `liveStreamSong` song
  const [isPreStream, setIsPreStream] = useState(true);

  const isPreStreamRef = useRef(true);


  const playlistIndexRef = useRef(0);

  const [song,setSong] = useState(playlist[0]);

  const handleSongEnded = () => {
    // before stream and end of stream, we play songs from `playlist`
    console.log("SONG ENDED PRESTREAM",isPreStreamRef.current);
    if (isPreStreamRef.current) {
      playlistIndexRef.current = (playlistIndexRef.current + 1) % playlist.length;
      setSong(playlist[playlistIndexRef.current]);
    } else {
      setSong({
        src: "/assets/audio/songs/DriftingAt432/audio.mp3", name: "Drifting At 432 Hz - Unicorn Heads"
      });
    }
  }

  useEffect(() => {
    if (sphereGoldMaterial.current) {
      sphereGoldMaterial.current.copy(goldMaterial.current);
    }
  }, [sphereGoldMaterial])


  const sphereSpacingX = .06;
  const sphereNumberX = 20;
  const sphereNumberY = 10;
  const sphereRefs = useRef(
    [...Array(sphereNumberX)].map(() => 
      [...Array(sphereNumberY)].map(() => createRef())
    )
  );
  const barNumber = sphereNumberX/2;


  
  // Setup audio context
  useEffect(() => {
    audio.current = new Audio();
    audioContext.current = new (window.AudioContext)();
    analyser.current = audioContext.current.createAnalyser();


   // audio.current.playbackRate = 4;
    audio.current.onended = handleSongEnded;

   
    const source = audioContext.current.createMediaElementSource(audio.current);

    //source.playbackRate.value = 2; // Exam
    source.connect(analyser.current);

    

    analyser.current.connect(audioContext.current.destination);
    analyser.current.smoothingTimeConstant = .9;
    analyser.current.fftSize = 256; // Size of FFT
    const bufferLength = analyser.current.frequencyBinCount;
    dataArray.current = new Uint8Array(bufferLength);
  }, []);

  const cube058 = gltfCam.scene.getObjectByName("Cube058")

  useEffect(() => {

    if (audio.current) {
      
      audio.current.pause();
      
      audio.current.src = song.src;
    
      audio.current.play();
    }
      
    return () => {
      if (audio.current) {
        audio.current.pause();
      }
    }
  }, [song])

  
  let prevChunked = new Array(8);
  let prevPos = 0;

  useEffect(() => {
    if (groupRef.current) {
      
      groupRef.current.scale.set(.8,.8,.8);
      var vvv = new Vector3();
      cube058.getWorldPosition(vvv);
    //  console.log('setting pos',vvv,sphereRefs)
      groupRef.current.position.set(vvv.x+.06,vvv.y - .12,vvv.z+.1
      );
    }
  },[groupRef])

  


  useEffect(() => {
 //   console.log("sssref",sphereRefs);
    for (const sphereRefs_arr of sphereRefs.current) {
      for (const entry of sphereRefs_arr) {
        if (entry.current) {
          
          if (sphereGoldMaterial.current) {
            entry.current.material = sphereGoldMaterial.current;
            entry.current.material.transparent = true;
          }
        //  entry.current.material = sphereGoldMaterial.current;
        }
      }
    }
  },[sphereRefs])


  // Animate the string based on audio data
  useFrame(() => {



    if (!analyser.current) {
      return;
    }

    analyser.current.getByteFrequencyData(dataArray.current);
   // console.log("data",dataArray.current);

    let points = [
      // left end point

    ];
    points.push(-1.1,0,0)
    for (let i = 0; i < dataArray.current.length; i++) {
        const point = (dataArray.current[i]/255)*40 || 0;
     //   points.push(i + 10,point,0);
    }

  //  console.log("groupRef",groupRef);

  //  lineRef.current.setPoints(points);
   // line2Ref.current.setPoints(points);

   // spheres[0].position.x += 1;


    const chunked = 
    [
      new Array(barNumber)
    .fill(0)
    .map((_,index) => dataArray.current.slice(Math.floor(dataArray.current.length / barNumber) * index, Math.floor(dataArray.current.length / barNumber) * (index + 1)))
    .map(chunk => chunk.reduce((a,b) => a + b) * .00015),
    null
    ]
    .map((val,index,self) => index === 1 ? self[0].slice() : val.slice().reverse())
    .flat(1)

   // console.log("chunked",chunked)

    const alpha = .8;

 //  sphereRefs.current[0][0].current.material.color = "red";
    chunked.forEach((chunk,index) => {
    
      //console.log("chunk",chunk);

      chunk = THREE.MathUtils.clamp(chunk,0,.32);

      // using Exponential Moving Average to try to make the movement less jittery
      let smoothChunk = (prevChunked[index] > 0 ? prevChunked[index] : 1) * (1 - alpha) + chunk * alpha;
     // console.log("prev chunked",prevChunked[index],index)

  

     const sphereRefsCol = sphereRefs.current[index];


    let ii = 0;
     for (const entry of sphereRefsCol) {
      if (entry.current) {
    //    entry.current.material.opacity = 1;
    
    if (true || ii > 0) {
      if (chunk > 0) {
        entry.current.position.set(index*(sphereSpacingX)-(1.3-.2),chunk+((ii*.5)/sphereNumberY)-.42,0)
      } else {
        entry.current.position.set(index*(sphereSpacingX)-(1.3-.2),chunk+((ii*.5)/sphereNumberY)-.41,0)
      }
     

      //console.log("LOC",entry.current.position.y)
      if (entry.current.position.y < 0) {
        entry.current.material.opacity = 0;
      } else {
        entry.current.material.opacity = 1;
     }
    } 
        ii++;
      }
    }
    

   /*  if (chunk > .2) {
      for (const entry of sphereRefsCol) {
        if (entry.current) {
          entry.current.material.opacity = 1;
        }
      }
     } else {
      for (const entry of sphereRefsCol) {
        if (entry.current) {
          entry.current.material.opacity = 0;
        }
      }
     }*/

  //   console.log("CHUNK",chunk,sphereRefsCol);
   // sphereRefsCol[0].current.material.color = "red";
     if (index == 0) {
     // for (let i = 0; i < 10; i++) {
       // sphereRefsCol[i].current.material.color = "red"
   //   }
     }


    /*
     // set the number of visible ones
     if (chunk > .1) {
      for (let i = 0; i < 10; i++) {
        sphereRefsCol[i].current.material.transparent = true;
        sphereRefsCol[i].current.material.opacity = 1;
      }
     } else {
      sphereRefsCol[0].current.material.opacity = 1;
      sphereRefsCol[0].current.material.transparent = true;
      for (let i = 2; i < 10; i++) {
        sphereRefsCol[i].current.material.transparent = true;
        sphereRefsCol[i].current.material.opacity = 0;
      }
     }*/

   //   console.log();
   //  sphereRefs.current[index][0].current.position.set(index*.15-(1.3-.2),chunk,0)
      points.push(index*(sphereSpacingX)-(1.3-.2),chunk+(((sphereRefsCol.length - 1)*.5)/sphereNumberY)-.42,0)
    });



    points.push(1.3,0,0)

    lineRef.current.setPoints(points);

    //console.log("chunked points",points);

    prevChunked = chunked.map(c => c);
    //console.log("now prev",prevChunked,chunked);





    return;
  });


  return (
    <>
  {visible && 
  
    <group ref={groupRef}>

      {/*
        font-family: 'Poppins';
  font-style: normal;
  font-weight: 600;
  font-size: 39px;
  line-height: 58px;

  color: #FFFFFF;
      */}

      <Html>
        <div style={{
          width: "400px", position: "absolute",
          left: -150, top: 5,
          fontFamily: "Poppins",
          fontStyle: "normal",
          fontWeight: "600",
          fontSize: "14px",
          lineHeight: "58px",color: "#FFFFFF"
        }}>
          {song.name}
          </div>
      </Html>
   
        <mesh position={[0,0,0]} ref={meshRef}>
        <meshLineGeometry ref={lineRef} attach="geometry"/>
        <meshLineMaterial
        attach="material"
        lineWidth={.3}
        opacity={0}
        transparent={true}
        
        color="aqua"/>
    </mesh>

    <mesh position={[0,0,0]} > 
        <meshLineGeometry attach="geometry" points={[[-1.2,0,0],[1.1,0,0]]}/>
        <meshLineMaterial
        attach="material"
        lineWidth={.2}
        opacity={1}
        transparent={true}
    
        
        color="white"/>
    </mesh> 

    {/* left end ball */}
    <mesh position={[-1.2,0.0,0]}>
      <boxGeometry args={[.07,.07,.01]}/>
      <primitive object={goldMaterial.current}/>
    </mesh>

    {/* right end ball */}
    <mesh position={[1.1,0,0]}>
      <boxGeometry args={[.07,.07,.05]}/>
      <primitive object={goldMaterial.current}/>
    </mesh>


    {sphereRefs.current.map((sRefs,iIndex) => {
      //console.log('sRef',sRefs)
      return sRefs.map((sRef,jIndex) => {

        const materialInstance = goldMaterial.current.clone(); // Clone the original material

        return (
          <mesh ref={sRef} position={[iIndex*.1,jIndex*.060,0]}>
            <sphereGeometry args={[0.015]}/>
            <meshStandardMaterial {...materialInstance} /> 
          </mesh>
        )
      })
    })}

    
    
      {
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].map((_,index) => {
        return  <mesh position={[(sphereRefs.current.length+index)*(sphereSpacingX)-1.1,.038,0]}>
            <sphereGeometry args={[0.015]}/>
            <primitive object={goldMaterial.current}/>
    </mesh>

      })
    }
    
    


</group>
 }
    </>

  );
});

export default AudioVisualizer;
