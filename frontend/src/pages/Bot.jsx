import React, { useState } from 'react';
import axios from "axios"
import ReactMarkdown from 'react-markdown'

import './Bot.css';

function Bot() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with your farming concerns today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    setIsButtonDisabled(true);
    
    if (input.trim()) {
      // Add user message to chat
      const userMessage = { sender: 'user', text: input };
      setMessages([...messages, userMessage]);

      try {
        // Send POST request to backend
        const response = await axios.post('http://localhost:8080/chatbot', {
          message: userMessage,
        });
        console.log(response.data);
        const botMessage = { sender: 'bot', text: response.data };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message to backend:', error);
      }
      setInput('');
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className="bot-page-container">
      <h1 className="bot-title">Chat with AgroBot</h1>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            <ReactMarkdown>{message.text}</ReactMarkdown>
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
          onClick={handleSendMessage} 
          disabled={isButtonDisabled}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Bot;
