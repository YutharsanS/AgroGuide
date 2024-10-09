import React, { useState } from 'react';
import './Community.css';

function Community() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'John Doe',
      text: 'What is the best time to plant tomatoes?',
      replies: [
        { id: 1, name: 'Jane Smith', text: 'I usually plant them in early spring for best results.' }
      ]
    },
    {
      id: 2,
      name: 'Anna Green',
      text: 'How do you keep pests away from lettuce crops?',
      replies: [
        { id: 2, name: 'Sam Farmer', text: 'Using organic pesticides has worked for me!' }
      ]
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [replyName, setReplyName] = useState('');  // State for the reply name
  const [replyText, setReplyText] = useState('');  // State for the reply message
  const [replyingTo, setReplyingTo] = useState(null);  // Track which message we're replying to

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
        {messages.map((msg) => (
          <div key={msg.id} className="message-container">
            <p className="message-name">{msg.name}:</p>
            <p className="message-text">{msg.text}</p>

            {/* Replies section */}
            <div className="replies-section">
              {msg.replies.map((reply) => (
                <div key={reply.id} className="reply-container">
                  <p className="reply-name">{reply.name}:</p>
                  <p className="reply-text">{reply.text}</p>
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
