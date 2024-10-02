import React, { useState, useEffect } from 'react';
import "../../Styles/Timer.css";

const Timer = () => {
  // Set up initial countdown time (e.g., 10 minutes for the demo)
  const initialTime = 10 * 60; // 10 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Update the timer every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    // Clear the timer on component unmount
    return () => clearInterval(timerId);
  }, []);

  // Convert time left to minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className='timer-container'>
         <div>
          <title>Timer</title>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};


export default Timer;
