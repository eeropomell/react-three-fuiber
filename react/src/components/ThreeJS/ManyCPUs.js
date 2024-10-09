import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as THREE from "three";
import { Mesh } from 'three';
import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { createRef } from 'react';
import { Group } from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


const ManyCPUs = ({ visible
 }) => {
  
    if (!visible) {
        return;
    }

    return (
        <>
        <group position={[40,0,-70]}>
        {[
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(10,2,-1),
            new THREE.Vector3(-10,5,0),
            new THREE.Vector3(-2,-5,-10),
            new THREE.Vector3(10,10,-1),
            new THREE.Vector3(10,-15,10),
            new THREE.Vector3(20,5,-10),
            new THREE.Vector3(-20,5,-10),
            new THREE.Vector3(20,-5,18),
            new THREE.Vector3(2,-7,-1),
            new THREE.Vector3(-2,-2,-20),
            new THREE.Vector3(20,10,-10),
            new THREE.Vector3(-20,15,-10),
            new THREE.Vector3(20,15,0),
            new THREE.Vector3(-19,-5,-50),

            new THREE.Vector3(-19,-5,-50),


            new THREE.Vector3(-18,10,0),
            new THREE.Vector3(-15,5,0),
            new THREE.Vector3(0,10,0),
            new THREE.Vector3(5,12,-1),
            new THREE.Vector3(-10,-5,-30),
        ].map((pos,index) => {
            return (
                <CPU index={index} pos={pos}/>
            )
        })}
        </group>
        </>
    )

};

const CPU = ({index,pos}) => {

    const blueChipGLTF = useLoader(GLTFLoader, '/assets/models/blueChipSceneThree3.gltf');

    console.log("BLKUECHIP",blueChipGLTF)

    const blueChipRef = useRef(null);

    const rotationSpeed = .002;
    
    let v = new Vector3( (Math.random() * 2 - 1) * 3,  Math.random() * 2.5 + 0.1,  (Math.random() * 2 - 1) * 15 );
    blueChipGLTF.scene.position.set(pos.x,pos.y,pos.z);

    const dogPlane = blueChipGLTF.scene.getObjectByName("Plane118")
    if (dogPlane) {
        dogPlane.material.opacity = 0;
        dogPlane.material.transparent = true;
    }

    blueChipGLTF.materials["Gold.002"].emissiveIntensity = 10;
   // blueChipGLTF.materials["Intel.003"].metallic = 0;

   // blueChipGLTF.scene.getObjectByName("Plane118").material.opacity = 1;
    

    useEffect(() => {

        if (blueChipRef.current) {
         
        }   

    }, [blueChipRef])
   

    useFrame(() => {
        if (blueChipRef.current) {
          
            if (index % 3 ==1){ 
                blueChipRef.current.rotation.x += rotationSpeed
            } else if (index % 3 == 0) {
                blueChipRef.current.rotation.y += rotationSpeed
            } else {
                blueChipRef.current.rotation.z += rotationSpeed
            }

        }
        
    })

    return (
        <primitive object={blueChipGLTF.scene.clone()} ref={blueChipRef}/>
    )
}

export default ManyCPUs;
