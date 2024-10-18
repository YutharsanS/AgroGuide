import { useState, useEffect } from 'react';
import axios from 'axios';
import './Community.css';
import communityImg from '../assets/community-page.jpg';

/**
 * The Community function is a React component that renders a community forum
 * where users can post messages and replies. It manages the state for messages,
 * new messages, replies, and visibility of messages.
 */
function Community() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [replyName, setReplyName] = useState('');  // State for the reply name
  const [replyText, setReplyText] = useState('');  // State for the reply message
  const [replyingTo, setReplyingTo] = useState(null);  // Track which message we're replying to
  const [visibleMessages, setVisibleMessages] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');  // State for the search query

  /**
   * Fetches messages from the server and updates the state with the fetched messages.
   */
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:8080/chatbot/allposts');
      setMessages(response.data.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch all the posts from backend
  useEffect(() => {
    fetchMessages();
  }, []);

  /**
   * Posts a new message to the server and updates the state to reflect the changes.
   */
  const handlePostMessage = async () => {
    if (newName.trim() && newMessage.trim()) {
      const newMessageObj = {
        userName: newName,
        postMessage: newMessage,
        postDate: new Date().toString(),
        replies: []
      };

      try {
        await axios.post('http://localhost:8080/chatbot/postMessage', newMessageObj);
        fetchMessages();
        setNewMessage('');
        setNewName('');
        window.location.reload();
        window.scrollTo(0, 20);
      } catch (error) {
        console.error('Error posting message:', error);
      }
    }
    console.log(new Date().toString());
  };

  /**
   * Posts a reply to a specific message on the server and updates the state.
   *
   * @param {string} msgId - The ID of the message being replied to.
   */
  const handleReply = async (msgId) => {
    if (replyName.trim() && replyText.trim()) {
      const newReply = {
        userName: replyName,
        replyMessage: replyText,
        replyDate: new Date().toString(),
        _id: { $oid: msgId }
      };

      try {
        const response = await axios.post("http://localhost:8080/chatbot/addReply", newReply);
        fetchMessages(); // Refresh messages after posting a reply
        setReplyText('');  // Reset reply text after submission
        setReplyName('');
        setReplyingTo(null);  // Close the reply input after posting
      } catch (error) {
        console.error('Error posting reply:', error);
      }
    }
  };

  /**
   * Searches for posts based on the search query and updates the state with the results.
   */
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const response = await axios.post('http://localhost:8080/chatbot/getPosts', {
          request: searchQuery
        });
        setMessages(response.data.reverse());
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    }
  };

  /**
   * Increases the number of visible messages by a fixed number.
   */
  const loadMoreMessages = () => {
    setVisibleMessages((prevVisibleMessages) => prevVisibleMessages + 5);
  }

  return (
    <div className="community-container">
      <h2 className="community-title">Community Forum</h2>
      <center><img src={communityImg} alt="community" /></center>
      
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

      {/* Search bar to search for posts */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
        />
        <button onClick={handleSearch} className="search-btn">Search</button>
      </div>

      <div className="messages-section">
        {messages.slice(0, visibleMessages).map((msg, index) => (
          <div key={index} className="message-container">
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
                onClick={() => setReplyingTo(msg._id.$oid)}
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
                    onClick={() => handleReply(msg._id.$oid)} 
                  >
                    Post Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Button to load more messages */}
      {visibleMessages < messages.length && (
        <button onClick={loadMoreMessages} className="load-more-btn">Load More</button>
      )}

    </div>
  );
}

export default Community;