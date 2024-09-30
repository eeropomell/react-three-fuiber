import React from 'react';
import { useEffect } from 'react';

const AudioVisualizer = ({searchParams}) => {

    const top = searchParams.get("audioViz_top") + "px" || "auto";
    const left = searchParams.get("audioViz_left") + "px" || "auto";
    const height = searchParams.get("audioViz_height") || "auto";

    useEffect(() => {
        console.log("DOG",searchParams, top, left,height);
    }, [])

  return (
    <div style={{
        position: "absolute",
        top: top, left,
    }}>
      <img src="/assets/images/songName.png" height={height}/>
    </div>
  );
};



export default AudioVisualizer;
