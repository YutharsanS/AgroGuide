import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../assets/logo.jpg';

/**
     * Toggles the menu open and closed by updating the state.
     */
const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};

/**
 * Header component that includes the website's logo, title, and navigation menu.
 * 
 * @returns {JSX.Element} The header element containing the logo, title, and navigation links.
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="site-title">AgroGuide</h1>
        </div>

        <div className="menu-toggle" onClick={toggleMenu}>
          &#9776; {/* Unicode character for hamburger menu */}
        </div>

        <nav className={`navbar ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/instruction" className="nav-link">Instruction</Link>
            </li>
            <li className="nav-item">
              <Link to="/community" className="nav-link">Community</Link>
            </li>
            <li className="nav-item">
              <Link to="/bot" className="nav-link">AgroBot</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">About</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
