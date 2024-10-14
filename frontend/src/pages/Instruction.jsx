import { useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './Instruction.css';
import '../components/PlantList';
import PlantList from '../components/PlantList';

import instructionImg from '../assets/instruction-page.png';

function Instruction() {
  const [plantName, setPlantName] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fetchPlantData = async () => {
    setLoading(true);
    setError('');
    setIsButtonDisabled(true);
    try {
      const response = await axios.post("http://localhost:8080/chatbot/getInstruction", {
        message : plantName,
      });
      console.log(response.data);
      setPlantData(response.data);
    } catch (err) {
      setError('Failed to fetch plant data.', err);
    }
    setLoading(false);
    setIsButtonDisabled(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (plantName.trim()) {
      fetchPlantData();
    } else {
      setError('Please enter a valid plant name.');
    }
    
  };

  const handleExplainByBot = () => {
    localStorage.setItem('plantData', JSON.stringify(plantData));
  };

  return (
    <div className="instruction-container">
      <h1 className="instruction-title">Plant Instructions</h1>
      <center><img src={instructionImg} alt="instruction" className="instruction-image" /></center>
      <p className="instruction-subtitle">Enter a plant name to get detailed instructions on how to grow it effectively.</p>

      <form className="instruction-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="plant-input"
          placeholder="Enter plant name..."
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
        />
        <button type="submit" className="submit-btn" disabled={isButtonDisabled}>Get Instructions</button>
      </form>

      {loading && <p className="loading">Fetching data...</p>}

      {error && <p className="error">{error}</p>}

      {plantData && (
        <div className="plant-data">
          <PlantList plantData={plantData}/>
          <Link to="/bot" className="explain-btn" onClick={handleExplainByBot}>Explain by Bot</Link>
        </div>
      )}
    </div>
  );
}

export default Instruction;