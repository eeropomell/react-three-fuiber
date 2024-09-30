// Facecam.js
import React from 'react';
import '../../Styles/Facecam.css'; // Importing CSS module for styling
import { calculateHeightFromWidth } from '../../Utils/viewportUtils';

const Facecam = ({ type, width, height, borderColor, top, left, right, bottom }) => {

    const defaultWidth = 700;

  // Set default values for the props
  const facecamType = type || 'default';
  const facecamWidth = width || (defaultWidth + "px");
  const facecamHeight = height || calculateHeightFromWidth(16,9,width || defaultWidth);
  const facecamBorderColor = borderColor || '#000000';


  // Determine the className based on the type of facecam
  const facecamClass = `facecam ${facecamType}`;

  return (
    <div
      className={facecamClass}
      style={{
        width: facecamWidth,
        height: facecamHeight,
        borderColor: facecamBorderColor,
        top: top || 'auto',
        left: left || 'auto',
        right: right || 'auto',
        bottom: bottom || 'auto',
      }}
    >
      {/* Add your facecam rendering logic here */}
      <p>{facecamType.toUpperCase()} Facecam</p>
    </div>
  );
};

export default Facecam;
