import { useState, useEffect } from 'react';
import axios from "axios";
import ReactMarkdown from 'react-markdown';

import './Bot.css';
import chatbotImg from '../assets/chatbot-page.jpg';

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
  }, []);

  useEffect(() => {
    autoScrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    setIsButtonDisabled(true);

    if (input.trim()) {
      // Add user message to chat
      const userMessage = { sender: 'user', text: input };
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

  const handleClearMessages = () => {
    // Clear messages from state and local storage
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  const autoScrollToBottom = () => {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  return (
    <div className="bot-page-container">
      <h1 className="bot-title">Chat with AgroBot</h1>
      <center><img src={chatbotImg} alt="chat bot image" /></center>
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