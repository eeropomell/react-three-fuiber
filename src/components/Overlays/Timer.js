import React, { useState, useEffect } from 'react';

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
    <div style={styles.overlay}>
      <div style={styles.text}>Stream starting soon</div>
      <div style={styles.timer}>
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
    zIndex: 1000,
  },
  text: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  timer: {
    fontSize: '48px',
  },
};

export default Timer;
