import React from 'react';
import ReactMarkdown from 'react-markdown';

const PlantList = ({ plantData }) => {
    return (
        <div>
            {plantData.map((item, index) => (
                <div key={index}>
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
            ))}
        </div>
    );
};

export default PlantList;