import React, { useState, useEffect } from 'react';
import "../../Styles/ShowProject.css";
import "../../Styles/Interview.css";


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


        <div className="interview-box" id="showproject-desktop1" style={{
          position: "absolute",
          width: "1320px",
          height: "743px",
          left: "70px",
          top: "170px",
          opacity: "1",
          
          background: "#D9FFD9",
   
          
        }}>

        <div className='interview-names-text' style={{
          position: "absolute",
        fontSize:"30px",
          left: 15, top: 640
        }}>
        Name3's PC
        </div>

            <div className="interview-container-circle"
    style={{
      top: -10,
      left: -10
    }}></div>

<div className="interview-container-triangle"
    style={{
      top: -9,
      left: "100%",
      clipPath: "polygon(100% 0%, 0% 0%, 100% 100%)"
    }}></div>

<div className="interview-container-circle"
    style={{
      top: "100%",
      left: -10
    }}></div>
       

        </div>
        <div className="interview-box" id="showproject-facecam1" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "170px",
          
          background: "#D9FFD9",
        }}>

<div className='interview-names-text' style={{
          position: "absolute",
        fontSize:"20px",
          left: 10, top: 130
        }}>
        Name2
        </div>

        <div className="interview-container-triangle"
    style={{
      top: -9,
      left: "100%",
      clipPath: "polygon(100% 0%, 0% 0%, 100% 100%)"
    }}></div>

        <div className="interview-container-circle"
    style={{
      top: "100%",
      left: -10
    }}></div>
       

        </div>
          <div className="interview-box" id="showproject-facecam2" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "428px",
          
          background: "#D9FFD9",
   
          
        }}>

<div className='interview-names-text' style={{
          position: "absolute",
        fontSize:"20px",
          left: 10, top: 130
        }}>
        Name3
        </div>

        
        <div className="interview-container-circle"
    style={{
      top: "100%",
      left: "100%"
    }}></div>
       
              
       <div className="interview-container-circle"
    style={{
      top: "-4%",
      left: "100%"
    }}></div>

        </div>

<div className="interview-box" id="showproject-facecam3" style={{
          position: "absolute",
          width: "400px",
          height: "225px",
          left: "1460px",
          top: "690px",
          
          background: "#D9FFD9",
   
          
        }}>

        <div className='interview-names-text' style={{
          position: "absolute",
        fontSize:"20px",
          left: 10, top: 130
        }}>
        Antti
        </div>

                
        <div className="interview-container-circle"
    style={{
      top: "100%",
      left: "-2.5%"
    }}></div>

<div className="interview-container-triangle"
    style={{
      top: -9,
      left: "100%",
      clipPath: "polygon(100% 0%, 0% 0%, 100% 100%)"
    }}></div>
       
        </div>

        
    </div>
  );
};


export default ShowProject;
