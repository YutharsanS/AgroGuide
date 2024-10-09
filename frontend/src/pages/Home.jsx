import { Link } from "react-router-dom"

import "./Home.css"

import chatbotImage from "../assets/chatbot.jpg"
import communityImage from "../assets/community.jpg"
import instructionsImage from "../assets/instruction.jpg"
import heroImage from "../assets/hero.jpg"

export default function Home() {
    return (
        <div className="Home-page">
            <h1>Home</h1>

            <section id="hero" className="left-align">
                <div className="text-content">
                    <h1>Sow with Know-How, Grow with Ease</h1>
                    <p>Get personalized farming instructions and real-time support to cultivate your crops with confidence.</p>
                    <Link to="/instruction" className="btn btn-primary">Get Started</Link>
                    <Link to="/bot" className="btn btn-secondary">Ask the AgroBot</Link>
                </div>
            </section>
            
            <section id="instructions" className="right-align">
                <div className="image-placeholder">
                    <img src={instructionsImage} alt="instruction" />
                </div>
                <div className="text-content">
                    <h2>Get Personalized Farming Instructions</h2>
                    <p>Input your crop details and receive step-by-step instructions tailored to your farm. Start growing smarter today!</p>
                    <Link to="/instruction" className="btn btn-primary">Get Instructions</Link>
                </div>
            </section>

            <section id="community" className="left-align">
                <div className="text-content">
                    <h2>Join the Farmer's Community</h2>
                    <p>Connect with fellow farmers, share experiences, and get tips for making your crops thrive. Our community is built to support and grow together!</p>
                    <Link to="/community" className="btn btn-secondary">Explore the Community</Link>
                </div>
                <div className="image-placeholder">
                    <img src={communityImage} alt="community" />
                </div>
            </section>

            <section id="chatbot" className="right-align">
                <div className="image-placeholder">
                    <img src={chatbotImage} alt="Chatbot" />
                </div>
                <div className="text-content">
                    <h2>Chat with Our Farming Assistant</h2>
                    <p>Got questions about planting or procedures? Our smart farming assistant is here to help 24/7! Simply ask any question and get real-time guidance.</p>
                    <Link to="/bot" className="btn btn-primary">Talk to the AgroBot</Link>
                </div>
            </section>
        </div>
    )
}