import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Community.css';

function Community() {
  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [replyName, setReplyName] = useState('');  // State for the reply name
  const [replyText, setReplyText] = useState('');  // State for the reply message
  const [replyingTo, setReplyingTo] = useState(null);  // Track which message we're replying to

  // Fetch all the posts from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:8080/chatbot/allposts'); // Replace with your backend endpoint
        console.log(response.data);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);
  
  
  const handlePostMessage = () => {
    if (newName.trim() && newMessage.trim()) {
      const newMessageObj = {
        id: messages.length + 1,
        name: newName,
        text: newMessage,
        replies: []
      };
      setMessages([...messages, newMessageObj]);
      setNewMessage('');
      setNewName('');
    }
  };

  const handleReply = (msgId) => {
    if (replyName.trim() && replyText.trim()) {
      const updatedMessages = messages.map((msg) => {
        if (msg.id === msgId) {
          // If the message matches the one being replied to, add the new reply
          const newReply = {
            id: msg.replies.length + 1,
            name: replyName,
            text: replyText
          };
          return {
            ...msg,
            replies: [...msg.replies, newReply]
          };
        }
        return msg;
      });
      setMessages(updatedMessages);
      setReplyText('');  // Reset reply text after submission
      setReplyName('');
      setReplyingTo(null);  // Close the reply input after posting
    }
  };

  return (
    <div className="community-container">
      <h2 className="community-title">Community Forum</h2>

      {/* Form to post a new message */}
      <div className="post-message-form">
        <input
          type="text"
          placeholder="Enter your name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder="Enter your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="textarea-field"
        />
        <button onClick={handlePostMessage} className="post-btn">Post Message</button>
      </div>

      <div className="messages-section">
        {messages.map((msg, index) => (
          <div key={index} className="message-container">
            <p className="message-name">{msg.userName}:</p>
            <p className="message-text">{msg.postMessage}</p>

            {/* Replies section */}
            <div className="replies-section">
              {msg.replies.map((reply, index) => (
                <div key={index} className="reply-container">
                  <p className="reply-name">{reply.userName}:</p>
                  <p className="reply-text">{reply.replyMessage}</p>
                </div>
              ))}

              {/* Button to reply to a message */}
              <button 
                className="reply-btn" 
                onClick={() => setReplyingTo(msg.id)}  // Set the message we are replying to
              >
                Reply
              </button>

              {/* Conditionally render the reply input if replying to this message */}
              {replyingTo === msg.id && (
                <div className="reply-form">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Your Reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="textarea-field"
                  />
                  <button
                    className="post-btn"
                    onClick={() => handleReply(msg.id)}  // Post the reply to this specific message
                  >
                    Post Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;
