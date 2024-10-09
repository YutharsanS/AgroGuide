import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';  // Importing CSS for styling
import logo from '../assets/chatbot.jpg'; // Assuming you have a logo file

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };
  
    return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
          <h1 className="site-title">AgriGuide</h1> {/* Your website name */}
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
