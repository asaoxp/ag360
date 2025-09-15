import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IrrigationControl from './pages/IrrigationControl';
import LiveSensorData from './pages/LiveSensorData';
import DiseaseDetection from './pages/DiseaseDetection';
import PlantInfo from './pages/PlantInfo';
import MyFarm from './pages/MyFarm';
import VoiceAssistant from './pages/VoiceAssistant';
import Settings from './pages/Settings';
import About from './pages/About';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/irrigation" element={<IrrigationControl />} />
            <Route path="/sensors" element={<LiveSensorData />} />
            <Route path="/disease" element={<DiseaseDetection />} />
            <Route path="/plant" element={<PlantInfo />} />
            <Route path="/farm" element={<MyFarm />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
      </Router>
  );
}

export default App;