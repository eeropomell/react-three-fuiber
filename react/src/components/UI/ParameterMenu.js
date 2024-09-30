// src/components/ParameterMenu.js
import React, { useState } from 'react';
import "../../Styles/ParameterMenu.css"
import { usePause } from '../../Context/PauseContext';


const ParameterMenu = ({ params, setParams,sceneTime,setSceneTime }) => {
 
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

  const {time,setTime,timeResetFlag,setTimeResetFlag} = usePause();

  return (
    <div className="parameter-menu-container">
      <h3>Effect Parameters</h3>
      <div><strong>t = {time.toFixed(2)}</strong></div>
      <button style={{marginBottom: 10, marginTop: 10}}
      onClick={() => setTimeResetFlag(true)}>Restart</button>
    {
        Object.keys(params).map(key => {
            return (
                <>
                <div>{key}</div>
                <div style={{opacity: .7}}>{params[key]?.text}</div>
                <textarea type="text" name={key} value={params[key].value} onChange={handleChange}/>
                
                </>
            )
        })
    }
      {/* Add more parameters as needed */}
    </div>
  );
};

export default ParameterMenu;
