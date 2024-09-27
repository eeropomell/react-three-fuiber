import React from 'react';

const Credits = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.credits}>
        <p>Created by Your Name</p>
        <p>Special Thanks to...</p>
        {/* Add more credits as needed */}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'absolute',
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
  credits: {
    fontSize: '24px',
  },
};

export default Credits;
