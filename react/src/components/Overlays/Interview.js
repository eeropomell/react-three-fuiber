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
          
     
   
          
        }}>


<div className="interview-names-text" style={{
  position: "absolute",
  left: 15,
  top: 290
}}>Name3</div>

<div className="interview-container-triangle"
    style={{
      top: -9,
      left: -9,
      clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)"
    }}></div>

<div className="interview-container-triangle"
    style={{
      top: 390,
      left: 705,
      clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)"
    }}></div>


        </div>
        <div className="interview-box" id="facecam2" style={{
          position: "absolute",
          width: "706px",
          height: "392px",
          left: "1012px",
          top: "127px",  
        }}>

<div className="interview-container-circle"
    style={{
      top: -9,
      left: -10
    }}>

    </div>

    <div className="interview-names-text" style={{
  position: "absolute",
  left: 15,
  top: 290
}}>Name2</div>
        
<div className="interview-container-triangle"
    style={{
      top: 390,
      left: 705,
      clipPath: "polygon(100% 100%, 0% 100%, 100% 0%)"
    }}></div>


        </div>
        <div className="interview-box" id="facecam3" style={{
          position: "absolute",
          width: "706px",
          height: "392px",
          left: "201px",
          top: "343px",
          
      
          
        }}>

          
    <div className="interview-names-text" style={{
  position: "absolute",
  left: 15,
  top: 290
}}>Antti</div>

<div className="interview-container-triangle"
    style={{
      top: -9,
      left: 705,
      clipPath: "polygon(100% 0%, 0% 0%, 100% 100%)"
    }}></div>

    <div className="interview-container-circle"
    style={{
      top: -10,
      left: -10
    }}>

    </div>


    
    <div className="interview-container-circle"
    style={{
      top: 394,
      left: -10
    }}>

    </div>


        </div>

    </div>
  );
};


export default Interview;
