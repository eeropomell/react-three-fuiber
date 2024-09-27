// /src/context/PauseContext.js
import React, { createContext, useState, useContext } from 'react';

const PauseContext = createContext();

export const usePause = () => useContext(PauseContext);

export const PauseProvider = ({ children }) => {
  const [isPaused, setIsPaused] = useState(false);

  const togglePause = () => setIsPaused((prev) => !prev);

  return (
    <PauseContext.Provider value={{ isPaused, togglePause }}>
      {children}
    </PauseContext.Provider>
  );
};
