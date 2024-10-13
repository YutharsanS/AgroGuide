import './Footer.css';

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
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h2>Contact Us</h2>
                    <p>Email: support@agricultureguide.com</p>
                    <p>Phone: +123 456 7890</p>
                    <p>Address: 123 Green Road, Farmville, USA</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Agriculture Guide. All Rights Reserved.</p>
                <a href="#privacy-policy">Privacy Policy</a> | <a href="#terms">Terms of Service</a>
            </div>
        </footer>
    );
}

export default Footer;