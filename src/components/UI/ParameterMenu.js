// src/components/ParameterMenu.js
import React, { useState } from 'react';
import "../../Styles/ParameterMenu.css"

const ParameterMenu = ({ params, setParams }) => {
 
  // Requirements:  
  // - notify parent when a value changes
  // - 

  // no, 

  const handleChange = (e) => {
    console.log("E",e);
    const { name, value } = e.target;
    setParams(prev => {
      const newParams = { ...prev, [name]: {
        ...prev[name], value: value
      } };
      return newParams;

    });
  };

  return (
    <div className="parameter-menu-container">
      <h3>Effect Parameters</h3>
    {
        Object.keys(params).map(key => {
            return (
                <>
                <div>{key}</div>
                <div style={{opacity: .7}}>{params[key]?.text}</div>
                <input type="number" name={key} value={params[key].value} onChange={handleChange}/>
                </>
            )
        })
    }
      {/* Add more parameters as needed */}
    </div>
  );
};

export default ParameterMenu;
