import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from "three";
import { Mesh } from 'three';
import { useMemo } from 'react';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';


extend({MeshLineGeometry, MeshLineMaterial})

// Audio Visualizer Component
const AudioVisualizer = ({ audioUrl }) => {
  const stringRef = useRef();
  const [audioData, setAudioData] = useState([]);

  const analyser = useRef(null);

  const audio = useRef(null);
  const audioContext = useRef(null);

  const dataArray = useRef(null);

  const lineRef = useRef(null);
  
  // Setup audio context
  useEffect(() => {
    audio.current = new Audio(audioUrl);
    audioContext.current = new (window.AudioContext)();
    analyser.current = audioContext.current.createAnalyser();
 
    const source = audioContext.current.createMediaElementSource(audio.current);
    
    source.connect(analyser.current);
    analyser.current.connect(audioContext.current.destination);
    analyser.current.fftSize = 256; // Size of FFT
    const bufferLength = analyser.current.frequencyBinCount;
    dataArray.current = new Uint8Array(bufferLength);

    // Play the audio
    audio.current.play();

    return () => {
      audio.current.pause();
      audioContext.current.close();
    };
  }, [audioUrl]);

  // Animate the string based on audio data
  useFrame(() => {

    analyser.current.getByteFrequencyData(dataArray.current);
    console.log("data",dataArray.current);

    let points = [];
    for (let i = 0; i < dataArray.current.length; i++) {
        const point = dataArray.current[i]*.2 || 0;
        points.push(i + 10,point,0);
    }

    lineRef.current.setPoints(points);

    return;
  });

  return (
    <mesh position={[10,0,0]}>
        <meshLineGeometry ref={lineRef} attach="geometry"/>
        <meshLineMaterial
        attach="material"
        lineWidth={2}
    
        color="orange"/>
    </mesh>
  );
};

export default AudioVisualizer;
