# 🌱 Agriverse360

A comprehensive agricultural monitoring and management system with AI-powered plant identification and disease detection.

## 🏗️ Project Structure

This project consists of three main components:

### Frontend (`frontend/`)

A React-based web application providing the user interface for:

- 🌱 **Plant Information**: Search plants by name or upload images for identification
- 🦠 **Disease Detection**: Upload plant images to detect diseases using ML
- 💧 **Irrigation Control**: Monitor and control irrigation systems
- 📊 **Real-time Monitoring**: Farm conditions and sensor data
- 🎤 **Voice Assistant**: Voice-controlled farm management
- 📱 **My Crops**: Personal crop management and tracking

### Backend (`backend/`)

A Node.js/Express API server handling:

- 🔗 **API Orchestration**: Coordinates between frontend and ML services
- 🤖 **AI Integration**: OpenAI ChatGPT for plant information
- 🌐 **Plant ID API**: External plant identification service
- 💾 **Caching System**: In-memory caching for improved performance
- 🔐 **Authentication**: User management and security
- 📡 **Sensor Integration**: IoT device communication

### ML Service (`ml_service/`)

A Python/Flask service providing:

- 🦠 **Disease Detection**: TensorFlow model for plant disease classification
- 🧪 **Nutrient Analysis**: Plant nutrient deficiency detection
- 📊 **Model Serving**: RESTful API for ML predictions
- 🔍 **Health Monitoring**: Service health and status endpoints

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Python 3.7+** (for ML service)
- **Git** (for cloning)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agriverse360
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up Environment Variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file with your API keys:
   # - OPENAI_API_KEY
   # - PLANT_ID_API_KEY (optional, for plant identification)
   ```

### 🏃‍♂️ Running the Application

#### Option 1: Unified Startup (Recommended)
```bash
# Start all services at once
./start-all-services.sh
```

#### Option 2: Manual Startup

1. **Start Backend (includes ML service)**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend (in new terminal)**
   ```bash
   cd frontend
   npm start
   ```

### 🔍 Service Monitoring

Check service health and status:

```bash
# Quick health check
./check-services.sh

# Or manually check endpoints:
curl http://localhost:5001/health
curl http://localhost:5001/status
curl http://localhost:5004/health
```

## 📡 API Endpoints

### Backend API (Port 5001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/status` | GET | Detailed service status |
| `/api/upload` | POST | Upload image for disease detection |
| `/api/plant/search` | POST | Search plant by name |
| `/api/plant/identify` | POST | Identify plant from image |
| `/api/plant/info` | POST | Get detailed plant information |

### ML Service API (Port 5004)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | ML service health check |
| `/status` | GET | ML service detailed status |
| `/predict_disease` | POST | Disease detection from image |
| `/predict_nutrients` | POST | Nutrient analysis from image |

## 🔧 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend     │    │   ML Service    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 5004    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  External APIs  │
                    │  - OpenAI       │
                    │  - Plant.id     │
                    └─────────────────┘
```

## 🎯 Key Features

### 🌱 Plant Information System
- **Text Search**: Search plants by common or scientific name
- **Image Identification**: Upload photos for automatic plant recognition
- **AI-Powered Info**: Detailed care instructions from ChatGPT
- **Caching**: Fast responses for frequently searched plants
- **Fallback System**: Works even when external APIs are unavailable

### 🦠 Disease Detection
- **ML Model**: TensorFlow-based disease classification
- **38 Plant Types**: Support for various crops and plants
- **Confidence Scores**: Reliability indicators for predictions
- **Real-time Processing**: Fast image analysis

### 🧪 Nutrient Analysis
- **Deficiency Detection**: Identify nutrient deficiencies in plants
- **Multiple Nutrients**: NPK and micronutrient analysis
- **Visual Indicators**: Clear deficiency level reporting

## 📊 Monitoring & Health Checks

The system provides comprehensive monitoring:

- **Real-time Health Checks**: Automatic service monitoring
- **Status Endpoints**: Detailed service information
- **Unified Startup**: Single command to start all services
- **Log Management**: Centralized logging for all services

## 🛠️ Development

Each component has its own development environment:

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **ML Service**: Python with Flask and TensorFlow

### 🔄 Fallback System

The application includes a comprehensive fallback system that ensures functionality even when external dependencies are not available:

#### **Mock ML Service**
When Python dependencies are not installed, the system automatically starts a Node.js mock service that provides:
- ✅ Disease detection simulation
- ✅ Nutrient analysis simulation
- ✅ Health check endpoints
- ✅ Realistic response formats

#### **API Fallbacks**
- **OpenAI**: Uses mock plant data when API quota exceeded
- **Plant.id**: Uses mock identification when API unavailable
- **ML Service**: Uses mock responses when Python service unavailable

#### **Graceful Degradation**
- All features remain functional
- Clear indicators show when using mock data
- Installation instructions provided for full functionality

### 🚀 Quick Start (No Dependencies)

```bash
# Start everything (will use mock services if dependencies missing)
cd Agriverse360
./start-all-services.sh

# Or start backend only (auto-detects available services)
cd backend
npm run dev
```

### 📦 Installing Full Dependencies

#### **Python ML Service**
```bash
cd ml_service
pip install -r requirements.txt
```

#### **API Keys**
Add to `backend/.env`:
```env
OPENAI_API_KEY=your_openai_key
PLANT_ID_API_KEY=your_plant_id_key
```

See individual README files in each directory for detailed development instructions."# ag360" 
