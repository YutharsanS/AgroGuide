import './Footer.css';

import facebook from '../assets/facebook-icon.png';
import youtube from '../assets/youtube-icon.png';

/**
 * Renders the footer section of the web page. 
 * It includes sections for about, quick links, contact, and social media.
 * @returns {JSX.Element} A JSX element representing the footer.
 */
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <h2>Agriculture Guide</h2>
                    <p>Your go-to resource for all things agriculture. From planting tips to community discussions, we have it all.</p>
                </div>
                <div className="footer-section links">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/instruction">Instructions</a></li>
                        <li><a href="/bot">AgroBot</a></li>
                        <li><a href="/community">Community</a></li>
                        <li><a href="/about">About Us</a></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h2>Contact Us</h2>
                    <p>Email: support@agricultureguide.com</p>
                    <p>Phone: +123 456 7890</p>
                    <p>Address: 123 Green Road, Farmville, USA</p>
                </div>
                <div className="footer-section social">
                    <h2>Follow Us</h2>
                    <a href="https://www.facebook.com"><img src={facebook} alt="Facebook" /></a>
                    <a href="https://www.youtube.com"><img src={youtube} alt="YouTube" /></a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 AgroGuide. All Rights Reserved.</p>
                <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
            </div>
        </footer>
    );
}

export default Footer;