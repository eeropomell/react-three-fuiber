import React, { useState, useEffect } from 'react';
import "../../Styles/ShowProject.css";


const ShowProject = () => {
 
  

  return (
    <div style={{
        position: "relative",
width: "1920px",
height: "1080px",

background: "rgba(255,255,100,0)",


    }}>

    <title>Project Demos</title>

      {/*}  <img style={{position: "absolute", opacity: "1"}} width={1920} height={1080} src="/image2.png"/>*/}


        <div className="showproject-box" id="showproject-desktop1" style={{
          position: "absolute",
          width: "1320px",
          height: "743px",
          left: "70px",
          top: "170px",
          opacity: "1",
          
          background: "#D9FFD9",
   
          
        }}></div>
        <div className="showproject-box" id="showproject-facecam1" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "170px",
          
          background: "#D9FFD9",
   
          
        }}></div>
          <div className="showproject-box" id="showproject-facecam2" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "428px",
          
          background: "#D9FFD9",
   
          
        }}></div>

<div className="showproject-box" id="showproject-facecam3" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "690px",
          
          background: "#D9FFD9",
   
          
        }}></div>
    </div>
  );
};


export default ShowProject;
