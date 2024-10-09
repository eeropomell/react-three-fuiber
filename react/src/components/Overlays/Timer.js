import React, { useState, useEffect } from 'react';
import "../../Styles/Timer.css";
import { useLocation } from 'react-router-dom';

const Timer = () => {

  const query = new URLSearchParams(useLocation().search);

  const timeParam = query.get("time") || 10 * 60; // default 10 minutes
  const textParam = query.get("text") || "" // if empty just display the timeParam in center

  const [text,setText] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeParam);

  function removeEnclosingQuotes(str) {
    if (str.startsWith('"') && str.endsWith('"')) {
        return str.slice(1, -1);  // Removes the first and last character
    }
    return str;
}

  useEffect(() => {
    // Update the timer every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    
    console.log("text text",textParam,text,query.get("text"));

    if (!(textParam === "" || !textParam || textParam.trim().length === 0)) {
      console.log("SETTING text text")
      setText(removeEnclosingQuotes(textParam))
    }

  
    // Clear the timer on component unmount
    return () => clearInterval(timerId);
  }, []);

  // Convert time left to minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;


  return (
    <div className='timer-container' style={{
      display: "flex",
      flexDirection: "column", gap: "10px",
      alignItems: "center"
    }}>
<title>Timer</title>

<div>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
</div>
    
    {text && text != "" &&
    <div>
      {text}
    </div>
    }
    
    </div>
  );
};


export default Timer;
