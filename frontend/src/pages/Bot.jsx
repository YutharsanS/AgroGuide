import React, { useState } from 'react';
import './Bot.css';

function BotPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with your farming concerns today?' },
    { sender: 'user', text: 'Can you tell me the best way to grow tomatoes?' },
    { sender: 'bot', text: 'Sure! Tomatoes grow best in warm weather. Ensure they get at least 6-8 hours of sunlight and keep the soil moist but well-drained.' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim()) {
      // Add user message to chat
      const userMessage = { sender: 'user', text: input };
      setMessages([...messages, userMessage]);
      setInput('');

      // Simulate bot response from backend (replace this with actual API call)
      const response = await getBotResponse(input); // replace with actual API call
      const botMessage = { sender: 'bot', text: response };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }
  };

  const getBotResponse = async (userMessage) => {
    // Simulate a backend API call for bot response
    // You would replace this with an actual API call to the backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Here is some information about ' + userMessage);
      }, 1000);
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bot-page-container">
      <h1 className="bot-title">Chat with AgriBot</h1>
      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            {message.text}
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
          onKeyPress={handleKeyPress}
        />
        <button className="send-btn" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default BotPage;
