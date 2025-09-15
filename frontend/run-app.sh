#!/bin/bash

echo "Starting Agriverse360 frontend application setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed. Version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install Node.js which includes npm."
    exit 1
fi

echo "npm is installed. Version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo "Dependencies installed successfully!"

# Start the development server
echo "Starting the development server..."
echo "The application will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"

npm start