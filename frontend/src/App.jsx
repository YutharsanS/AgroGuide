import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Header from "./components/Header"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Instruction from "./pages/Instruction"
import Bot from "./pages/Bot"
import Community from "./pages/Community"
import About from "./pages/About"
import Contact from "./pages/Contact"

function App() {
  return (
    <>
      
      <BrowserRouter>
      <Header />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instruction" element={<Instruction />} />
          <Route path="/bot" element={<Bot />} />
          <Route path="/community" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
    </BrowserRouter>
    
    </>   
  )
}

export default App
