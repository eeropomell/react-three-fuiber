// /src/Components/overlays/PlayPauseButton.js
import React from 'react';
import { usePause } from '../../Context/PauseContext';

const PlayPauseButton = () => {
  const { isPaused, togglePause } = usePause();

  return (
    <button onClick={togglePause}>
      {isPaused ? 'Play' : 'Pause'}
    </button>
  );
};

export default PlayPauseButton;
