import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Header from "./components/Header"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Instruction from "./pages/Instruction"
import Bot from "./pages/Bot"

function App() {
  return (
    <>
      
      <BrowserRouter>
      <Header />
      <Routes>
          <Route path="/bot" element={<Bot />} />
          <Route path="/instruction" element={<Instruction />} />
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
    </BrowserRouter>
    
    </>   
  )
}

export default App
