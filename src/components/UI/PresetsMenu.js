// src/components/ParameterMenu.js
import React, { useState } from 'react';
import "../Styles/PresetsMenu.css"

const PresetsMenu = ({ presets, setParams,marginTop=0 }) => {
 
  // Requirements:  
  // - notify parent when a value changes
  // - 

  // no, 

  const handleClick = (key) => {
    const preset = presets[key];
  
    // Update params while preserving 'text' properties
    setParams(prevParams => {
      return {
        ...prevParams, // Preserve existing params
        ...Object.keys(preset).reduce((acc, key) => {
          if (prevParams[key]) {
            acc[key] = {
              value: preset[key], // Update value from preset
              text: prevParams[key].text // Preserve existing text
            };
          } else {
            // If the key doesn't exist in prevParams, just set the value
            acc[key] = { value: preset[key] };
          }
          return acc;
        }, {})
      };
    });
  };
  

  return (
    <div className="preset-menu-container" style={{marginTop}}>
      <h3><strong>PRESETS</strong></h3>
    {
        Object.keys(presets).map(key => {
            return (
                <>
              
                <button onClick={() => handleClick(key)}>
                  {key}
                </button>
        
                </>
            )
        })
    }
      {/* Add more parameters as needed */}
    </div>
  );
};

export default PresetsMenu;
