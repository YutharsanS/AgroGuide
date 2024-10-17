import React from 'react';
import ReactMarkdown from 'react-markdown';

const PlantList = ({ plantData }) => {
    const capitalizeFirstLetter = (word) => {
        if (!word) return ''; // Check for empty or undefined strings
        return word.charAt(0).toUpperCase() + word.slice(1);
      };
    
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