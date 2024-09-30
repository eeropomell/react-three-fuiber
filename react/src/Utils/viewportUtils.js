/**
 * Calculate height based on width for a 16:9 aspect ratio.
 * @param {number} width - The width of the element.
 * @returns {number} - The calculated height.
 */
export const calculateHeightFromWidth = (aspectRatioWidth,aspectRatioHeight, width) => {
    return (width / aspectRatioWidth) * aspectRatioHeight;
};
