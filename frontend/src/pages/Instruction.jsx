import React, { useState } from 'react';
import './Instruction.css';

function Instruction() {
  const [plantName, setPlantName] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPlantData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://your-backend-api.com/plants?name=${plantName}`);
      const data = await response.json();
      if (data) {
        setPlantData(data);
      } else {
        setError('No data found for this plant.');
      }
    } catch (err) {
      setError('Failed to fetch plant data.');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (plantName.trim()) {
      fetchPlantData();
    } else {
      setError('Please enter a valid plant name.');
    }
  };

  return (
    <div className="instruction-container">
      <h1 className="instruction-title">Plant Instructions</h1>
      <p className="instruction-subtitle">Enter a plant name to get detailed instructions on how to grow it effectively.</p>
      
      <form className="instruction-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="plant-input"
          placeholder="Enter plant name..."
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
        />
        <button type="submit" className="submit-btn">Get Instructions</button>
      </form>

      {loading && <p className="loading">Fetching data...</p>}

      {error && <p className="error">{error}</p>}

      {plantData && (
        <div className="plant-data">
          <h2 className="plant-name">{plantData.name}</h2>
          <p className="plant-description">{plantData.description}</p>
          <h3>Growing Instructions:</h3>
          <ul className="growing-instructions">
            {plantData.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Instruction;
