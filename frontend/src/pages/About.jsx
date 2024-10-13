import React from "react";
import './About.css'; // Assuming you'll add some styles for the About page

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Us</h1>
        <p>Your Trusted Companion for Modern Farming</p>
      </div>

      <div className="about-content">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At Agri Guide, our mission is to empower farmers by providing them with easy access to accurate, timely, and effective agricultural knowledge. 
            We believe in blending traditional farming techniques with cutting-edge technology to help farmers enhance productivity, sustainability, and profitability.
          </p>
        </section>

        <section className="services-section">
          <h2>What We Offer</h2>
          <p>
            We offer a comprehensive platform where farmers can find detailed instructions about planting, growing, and managing various crops. 
            Our easy-to-use interface, combined with a powerful chatbot assistant, ensures that farmers receive the right information when they need it.
          </p>
          <ul>
            <li><strong>Planting Instructions:</strong> Get detailed guides on how to plant and grow different crops effectively.</li>
            <li><strong>AgroBot:</strong> Interact with our AI-powered chatbot for real-time solutions to your agricultural questions.</li>
            <li><strong>Community Support:</strong> Connect with fellow farmers, share knowledge, and seek advice from the broader agricultural community.</li>
          </ul>
        </section>

        <section className="vision-section">
          <h2>Our Vision for the Future</h2>
          <p>
            We envision a future where every farmer, regardless of their location or background, has access to the latest agricultural advancements and community support. 
            Our goal is to create a more sustainable, innovative, and prosperous agricultural ecosystem where technology and nature work together for the betterment of all.
          </p>
        </section>

        <section className="community-section">
          <h2>Join Our Community</h2>
          <p>
            Our platform is more than just a tool — it's a community. By joining us, you're not only gaining valuable agricultural insights but also contributing to a global network of farmers, researchers, and agricultural enthusiasts.
            Share your experiences, seek advice, and grow with us!
          </p>
        </section>

        <section className="commitment-section">
          <h2>Our Commitment to You</h2>
          <p>
            We are committed to providing high-quality, reliable information that supports farmers in making informed decisions. Whether you are a small-scale farmer or managing large fields, we are here to help you grow and succeed. 
            Together, we can cultivate a brighter future for agriculture.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
