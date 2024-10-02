import React, { useState, useEffect } from 'react';
import "../../Styles/Timer.css";
import { useLocation } from 'react-router-dom';

const Timer = () => {

  const query = new URLSearchParams(useLocation().search);

  const timeParam = query.get("time") || 10 * 60; // default 10 minutes
  const textParam = query.get("text") || "" // if empty just display the timeParam in center

  const [text,setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeParam);

  useEffect(() => {
    // Update the timer every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    
    setText(textParam);
  
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
