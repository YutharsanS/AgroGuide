import React from 'react';
import './NotFound.css';
import { Link } from 'react-router-dom';
import notFoundImage from '../assets/not-found.png';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>
          It seems like the page you are looking for has been uprooted. Let's get back on the right path and help you grow your knowledge.
        </p>
        <Link to="/" className="home-button">Go to Homepage</Link>
      </div>
      <div className="not-found-image">
        <img
          src={notFoundImage}
          alt="Lost in the fields"
        />
      </div>
    </div>
  );
};

export default NotFound;
