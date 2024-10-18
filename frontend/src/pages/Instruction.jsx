import { useState } from 'react';
import { Link } from 'react-router-dom';

import axios from 'axios';
import './Instruction.css';
import PlantList from '../components/PlantList';

import instructionImg from '../assets/instruction-page.png';

/**
 * The Instruction function is a React component that allows users to
 * input a plant name and retrieve instructions on how to grow the plant.
 * It handles data fetching, error handling, and displays the plant data.
 */
function Instruction() {
  const [plantName, setPlantName] = useState('');
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [APIImageSrc, setAPIImageSrc] = useState('');

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  
  /**
   * Fetches an image of the plant category from an external API.
   * @param {string} category - The category of the plant.
   * @returns {void}
   */
  const fetchImage = async (category) => {
    try {
      const response = await axios.post("http://localhost:8080/chatbot/pixabayAPI", {"message": category});
      console.log(response.data);
      if (response.data.imgurl) {
        setAPIImageSrc(response.data.imgurl);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  }
  
  /**
   * Fetches plant data from the server based on the plant name.
   * @returns {void}
   */
  const fetchPlantData = async () => {
    setLoading(true);
    setError('');
    setIsButtonDisabled(true);
    try {
      const response = await axios.post("http://localhost:8080/chatbot/getInstruction", {
        message : plantName,
      });
      setPlantData(response.data);
      fetchImage(response.data[0].category);
    } catch (err) {
      setError('Failed to fetch plant data.', err);
    }
    setLoading(false);
    setIsButtonDisabled(false);
  };

  /**
   * Handles the form submission event.
   * @param {Event} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (plantName.trim()) {
      fetchPlantData();
    } else {
      setError('Please enter a valid plant name.');
    }
    
  };

  /**
   * Stores the fetched plant data in local storage to be used by the bot.
   * @returns {void}
   */
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

      {plantData && plantData.length > 0 && APIImageSrc && <center><img src={APIImageSrc} alt="API" className="plant-img"/></center>}
      
      {plantData && (
        <div className="plant-data">
          {plantData.length > 0 ? <p>Matching Results for: {plantName}</p> : null}
          <PlantList plantData={plantData}/>
          <Link to="/bot" className="explain-btn" onClick={handleExplainByBot}>Explain by Bot</Link>
        </div>
      )}
      
    </div>
  );
}

export default Instruction;