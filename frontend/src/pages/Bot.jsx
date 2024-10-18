import { useState, useEffect } from 'react';
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import TypewriterEffect from '../components/TypewriterEffect';

import './Bot.css';
import chatbotImg from '../assets/chatbot-page.jpg';

/**
 * Represents a chat bot component that handles user interactions and messages.
 * Provides functionality to send and receive messages, and store them in local storage.
 * @function Bot
 * @returns {JSX.Element} The rendered chat bot component.
 */
function Bot() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with your farming concerns today?' }
  ]);
  const [input, setInput] = useState('');

  // Load messages from local storage when the component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    // Check for plant data in local storage
    const plantData = localStorage.getItem('plantData');
    if (plantData) {
      const parsedPlantData = JSON.parse(plantData);
      const plantContent = parsedPlantData[0]?.content || '';
      const userMessage = { sender: 'user', text: plantContent };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Send plant data to bot
      handleSendMessage(plantContent);

      // Remove plant data from local storage
      localStorage.removeItem('plantData');
    }
  }, []);

  useEffect(() => {
    autoScrollToBottom();
  }, [messages]);

  /**
   * Automatically scrolls the chat window to the bottom.
   * @function autoScrollToBottom
   */
  const autoScrollToBottom = () => {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  /**
   * Handles sending a message to the chat bot.
   * @function handleSendMessage
   * @param {string} messageText - The text of the message to send.
   */
  const handleSendMessage = async (messageText) => {
    setIsButtonDisabled(true);

    const message = messageText || input;
    if (message.trim()) {
      // Add user message to chat
      const userMessage = { sender: 'user', text: message };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Save messages to local storage
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));

      try {
        // Send POST request to backend
        const response = await axios.post('http://localhost:8080/chatbot', {
          message: userMessage,
        });
        console.log(response.data);
        const botMessage = { sender: 'bot', text: response.data };
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);

        // Save messages to local storage
        localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
      } catch (error) {
        console.error('Error sending message to backend:', error);
      }
      setInput('');
      setIsButtonDisabled(false);

    }
  };

  /**
   * Clears all messages from the chat and local storage.
   * @function handleClearMessages
   */
  const handleClearMessages = () => {
    localStorage.removeItem('chatMessages');
    setMessages([{ sender: 'bot', text: 'Hello! How can I help you with your farming concerns today?' }]);
  };

  return (
    <div className="bot-page-container">
      <h1 className="bot-title">Chat with AgroBot</h1>
      <center><img src={chatbotImg} alt="chat bot" /></center>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            {(messages.length > 1) ? <ReactMarkdown>{message.text}</ReactMarkdown> : <TypewriterEffect text={message.text} speed={40} />}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="send-btn"
          onClick={() => handleSendMessage()}
          disabled={isButtonDisabled}
        >
          Send
        </button>
        <button
          className="clear-btn"
          onClick={handleClearMessages}
        >
          Clear Messages
        </button>
      </div>
    </div>
  );
}

export default Bot;