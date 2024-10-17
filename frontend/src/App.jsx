import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Header from "./components/Header"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Instruction from "./pages/Instruction"
import Bot from "./pages/Bot"
import Community from "./pages/Community"
import About from "./pages/About"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import Terms from "./pages/Terms"
import NotFound from './pages/NotFound'

/**
 * The App function sets up the main application routes using React Router.
 * It defines various routes and their corresponding components.
 * 
 * @returns {JSX.Element} The application routes wrapped in BrowserRouter.
 */
function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instruction" element={<Instruction />} />
        <Route path="/bot" element={<Bot />} />
        <Route path="/community" element={<Community />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
