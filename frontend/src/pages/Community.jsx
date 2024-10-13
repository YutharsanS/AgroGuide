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

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/chatbot/allposts'); // Replace with your backend endpoint
      console.log(response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Fetch all the posts from backend
  useEffect(() => {
    fetchMessages();
  }, []);
  
  
  const handlePostMessage = async () => {
    if (newName.trim() && newMessage.trim()) {
      const newMessageObj = {
        // id: messages.length + 1,
        userName: newName,
        postMessage: newMessage,
        postDate: new Date().toString(),
        replies: []
      };

      try {
        const response = await axios.post('http://localhost:8080/chatbot/postMessage', newMessageObj); // Replace with your backend endpoint
        // setMessages([...messages]);
        fetchMessages();
        setNewMessage('');
        setNewName('');
      } catch (error) {
        console.error('Error posting message:', error);
      }
    }
    console.log(new Date().toString());
  };

  const handleReply = async (msgId) => {
    if (replyName.trim() && replyText.trim()) {
      const newReply = {
        userName: replyName,
        replyMessage: replyText,
        replyDate: new Date().toString(),
        _id: { $oid: msgId }
      };

      try {
        const response = await axios.post(`http://localhost:8080/chatbot/addReply`, newReply); // Replace with your backend endpoint
        fetchMessages(); // Refresh messages after posting a reply
        setReplyText('');  // Reset reply text after submission
        setReplyName('');
        setReplyingTo(null);  // Close the reply input after posting
      } catch (error) {
        console.error('Error posting reply:', error);
      }
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
        {messages.slice().reverse().map((msg, index) => (
          <div key={index} className="message-container">
            {/* {console.log(msg._id.$oid)} */}
            {/* <p>{msg._id?.$oid}</p> */}
            <p className="message-date">{new Date(msg.postDate).toLocaleString()}</p>
            <p className="message-name">{msg.userName}:</p>
            <p className="message-text">{msg.postMessage}</p>

            {/* Replies section */}
            <div className="replies-section">
              {msg.replies.map((reply, index) => (
                <div key={index} className="reply-container">
                  <p className="reply-date">{new Date(reply.replyDate).toLocaleString()}</p>
                  <p className="reply-name">{reply.userName}:</p>
                  <p className="reply-text">{reply.replyMessage}</p>
                </div>
              ))}

              {/* Button to reply to a message */}
              <button 
                className="reply-btn" 
                onClick={() => setReplyingTo(msg._id.$oid)}  // Set the message we are replying to
              >
                Reply
              </button>

              {/* Conditionally render the reply input if replying to this message */}
              {replyingTo === (msg._id.$oid) && (
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
                    onClick={() => handleReply(msg._id.$oid)}  // Post the reply to this specific message
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
