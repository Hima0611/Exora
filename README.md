# Exora - Exoplanet Explorer Web App

<!-- Project Overview Video -->
<video src="./src/assets/Proj_Video.mp4" controls width="600">
  Your browser does not support the video tag.
</video>

## Overview

Exora is a hybrid full-stack application combining a React frontend with a Flask backend for real-time NASA exoplanet data exploration and visualization. The app serves as both a modern landing page and a data-driven astronomical analysis platform.

## Key Features

- **Interactive Star Map**: Explore nearby exoplanet systems
- **Radial Velocity Analysis**: Advanced detection techniques for exoplanets
- **Discovery Trends**: Visualize exoplanet discovery methods over time
- **Planet Explorer**: Detailed information on confirmed exoplanets
- **Orbital Viewer**: 3D visualization of planetary systems

## Technology Stack

### Hybrid Architecture

- **Frontend**: React 19.1+ with Vite (port 5173)
- **Backend**: Flask + Python (port 5000)
- **Data Source**: NASA Exoplanet Archive API with local caching
- **Animations**: Framer Motion for React components, Three.js for 3D visualizations
- **Styling**: Component-scoped CSS with space-themed design patterns

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- npm or yarn

### Installation

1. Clone the repository

   ```
   git clone https://github.com/Hima0611/Exora.git
   cd Exora
   ```

2. Install frontend dependencies

   ```
   npm install
   ```

3. Install backend dependencies
   ```
   cd backend/backend
   pip install -r requirements.txt
   ```

### Running the Application

**IMPORTANT**: Both servers must be running simultaneously for full functionality!

1. Start the backend server (in one terminal):

   ```
   cd backend/backend
   python app.py
   ```

   The Flask server will run on http://localhost:5000

2. Start the frontend development server (in another terminal):

   ```
   npm run dev
   ```

   The React dev server will run on http://localhost:5173

3. Alternative (Windows only):
   ```
   cd backend/backend
   start_server.bat
   ```

## Project Structure

```
├── src/ (React Frontend)
│   ├── components/pages/     # React pages that integrate with backend APIs
│   ├── services/api.js       # Axios-based API client for Flask backend
│   └── components/           # Reusable UI components with CSS modules
├── backend/ (Flask API + HTML Pages)
│   ├── app.py               # Flask server with REST API + template routes
│   ├── services/            # NASA API integration and data processing
│   │   ├── nasa_api.py      # NASA Exoplanet Archive API client
│   │   └── data_processor.py # Statistical analysis and caching
│   ├── templates/           # Server-rendered HTML for complex visualizations
│   └── data/                # JSON cache files for NASA data
```

## Available Scripts

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint checking

## Key Components

### NASA Data Integration

- API client for NASA Exoplanet Archive
- Local caching system for performance optimization
- Statistical analysis for exoplanet data

### Radial Velocity Analysis

- Implements Lomb-Scargle periodogram for period detection
- Keplerian fitting for orbital parameters
- ML prediction pipeline for exoplanet detection

### Machine Learning Integration

- Synthetic data generation
- Periodogram analysis
- Orbital fitting and planet property estimation

## Contributing

Please read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License
