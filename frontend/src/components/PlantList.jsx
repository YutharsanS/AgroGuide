import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
     * Capitalizes the first letter of a given word.
     * 
     * @param {string} word The word to be capitalized.
     * @returns {string} The word with the first letter capitalized.
     */
const capitalizeFirstLetter = (word) => {
    if (!word) return ''; // Check for empty or undefined strings
    return word.charAt(0).toUpperCase() + word.slice(1);
};

/**
 * Renders a list of plants with capitalized names.
 * 
 * @param {Object} props Contains the data needed to render the plant list.
 * @param {Array} props.plantData An array of plant objects to be displayed.
 */
const PlantList = ({ plantData }) => {
    return (
        <div>
            {plantData.map((item, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                    <h2 style={{ color: 'green' }}>{capitalizeFirstLetter(item.category)}</h2>
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                    <hr style={{ marginTop: '20px' }} />
                </div>
            ))}
        </div>
    );
};

export default PlantList;