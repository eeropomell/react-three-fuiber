// /src/context/PauseContext.js
import React, { createContext, useState, useContext } from 'react';

const PauseContext = createContext();

export const usePause = () => useContext(PauseContext);

export const PauseProvider = ({ children }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);

  const togglePause = () => setIsPaused((prev) => !prev);

  const [timeResetFlag, setTimeResetFlag] = useState(false);

  return (
    <PauseContext.Provider value={{ isPaused, togglePause,time,setTime,timeResetFlag,setTimeResetFlag }}>
      {children}
    </PauseContext.Provider>
  );
};
