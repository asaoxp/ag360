import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="py-8">
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl p-8 text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to AgriVerse360</h1>
          <p className="text-xl mb-8">Revolutionizing Agriculture with Smart Technology</p>
          <p className="text-lg mb-8">Your comprehensive solution for smart farming and crop management</p>
          <div className="flex justify-center gap-4">
            <Link to="/irrigation" className="bg-white text-green-700 font-bold py-3 px-6 rounded-full hover:bg-green-100 transition duration-300">
              Get Started
            </Link>
            <Link to="/about" className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white hover:text-green-700 transition duration-300">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <h3 className="text-2xl font-bold mb-3 text-green-700">Smart Irrigation</h3>
            <p className="mb-4">Control your irrigation system manually, automatically, or with AI predictions for optimal water usage.</p>
            <Link to="/irrigation" className="text-green-600 font-semibold hover:text-green-800">Manage Irrigation →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold mb-3 text-blue-700">Live Sensor Data</h3>
            <p className="mb-4">Monitor real-time data from your sensors including temperature, humidity, soil moisture, and weather.</p>
            <Link to="/sensors" className="text-blue-600 font-semibold hover:text-blue-800">View Data →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <h3 className="text-2xl font-bold mb-3 text-purple-700">Disease Detection</h3>
            <p className="mb-4">Upload images of your plants for AI-powered disease detection and treatment recommendations.</p>
            <Link to="/disease" className="text-purple-600 font-semibold hover:text-purple-800">Detect Disease →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <h3 className="text-2xl font-bold mb-3 text-yellow-700">Plant Information</h3>
            <p className="mb-4">Get detailed information about your crops including watering schedules, light requirements, and cultivation timelines.</p>
            <Link to="/plant" className="text-yellow-600 font-semibold hover:text-yellow-800">Explore Plants →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <h3 className="text-2xl font-bold mb-3 text-red-700">My Farm Dashboard</h3>
            <p className="mb-4">Get an overview of your farm's health, active zones, and important alerts all in one place.</p>
            <Link to="/farm" className="text-red-600 font-semibold hover:text-red-800">View Dashboard →</Link>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <h3 className="text-2xl font-bold mb-3 text-indigo-700">Voice Assistant</h3>
            <p className="mb-4">Control your farm operations using voice commands for hands-free management.</p>
            <Link to="/voice" className="text-indigo-600 font-semibold hover:text-indigo-800">Try Voice Control →</Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Why Choose AgriVerse360?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="text-green-500 text-2xl mr-4">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Precision Agriculture</h3>
                <p>Optimize your farming practices with data-driven insights and AI-powered recommendations.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-green-500 text-2xl mr-4">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Resource Efficiency</h3>
                <p>Reduce water and fertilizer usage while maximizing crop yields through smart monitoring.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-green-500 text-2xl mr-4">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Early Disease Detection</h3>
                <p>Identify plant diseases before they spread, saving your crops and reducing losses.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-green-500 text-2xl mr-4">✓</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Accessible Technology</h3>
                <p>Designed for farmers of all tech levels with intuitive interfaces and voice control options.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-green-700">Ready to Transform Your Farm?</h2>
          <Link to="/settings" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition duration-300 inline-block">
            Configure Your System
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;