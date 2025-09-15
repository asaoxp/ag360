import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold flex items-center">
              <span className="bg-green-600 p-2 rounded-lg mr-2">🌾</span>
              AgriVerse360
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-1">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Home</Link>
            <Link to="/irrigation" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Irrigation</Link>
            <Link to="/sensors" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Sensors</Link>
            <Link to="/disease" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Disease Detection</Link>
            <Link to="/plant" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Plant Info</Link>
            <Link to="/farm" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">My Farm</Link>
            <Link to="/voice" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Voice Assistant</Link>
            <Link to="/settings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">Settings</Link>
            <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-300">About</Link>
          </div>
          
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;