import React, { useState, useEffect } from 'react';
import "../../Styles/Interview.css";


const Interview = () => {
 
  

  return (
    <div style={{
        position: "relative",
width: "1920px",
height: "1080px",

background: "rgba(255,255,100,0)",


    }}>
      <title>Interview</title>

        {/*<img style={{position: "absolute", opacity: ".2"}} width={1920} height={1080} src="/image.png"/>*/}


        <div className="interview-box" id="facecam1" style={{
          position: "absolute",
          width: "706px",
          height: "392px",
          left: "1012px",
          top: "560px",
          
     
   
          
        }}></div>
        <div className="interview-box" id="facecam2" style={{
          position: "absolute",
          width: "706px",
          height: "392px",
          left: "1012px",
          top: "127px",
          
     
   
          
        }}></div>
        <div className="interview-box" id="facecam3" style={{
          position: "absolute",
          width: "706px",
          height: "392px",
          left: "201px",
          top: "343px",
          
      
          
        }}></div>

    </div>
  );
};


export default Interview;
