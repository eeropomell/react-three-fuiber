import React from 'react';
import { useEffect } from 'react';
import "../../App.css";


const TestausLiveLogo = ({searchParams}) => {

    const top = searchParams.get("testausLiveLogo_top") + "px" || "auto";
    const left = searchParams.get("testausLiveLogo_left") + "px" || "auto";
    const height = searchParams.get("testausLiveLogo_height") || "auto";

    useEffect(() => {
        console.log("DOG",searchParams, top, left,height);
    }, [])

  return (
    <>
    <div style={{
        position: "absolute",
        top: top, left,
    }}>
      <img src="/assets/images/testausLiveLogo.png" height={height}/>
    </div>
    </>
  );
};



export default TestausLiveLogo;
