# Exora - Exoplanet Explorer Web App

## Project Overview

Exora is a **hybrid full-stack application** combining React frontend with Flask backend for real-time NASA exoplanet data exploration and visualization. The app serves both as a modern landing page and a data-driven astronomical analysis platform.

## Architecture & Key Components

### Hybrid Tech Stack

- **Frontend**: React 19.1+ with Vite (port 5173) - Landing page and modern UI
- **Backend**: Flask + Python (port 5000) - NASA API integration, data processing, and specialized pages
- **Data Source**: NASA Exoplanet Archive API with local caching system
- **Animations**: Framer Motion for React components, Three.js for 3D visualizations
- **Styling**: Component-scoped CSS with space-themed design patterns

### Critical Architecture Pattern

This is **NOT** a typical single-stack project. Two servers run simultaneously:

1. **React Dev Server** (5173): Modern landing page with features showcase
2. **Flask Server** (5000): Data APIs + server-rendered HTML pages for complex visualizations

### Project Structure

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
│   ├── data/               # JSON cache files for NASA data
│   └── start_server.bat    # Windows startup script
```

## Development Workflows

### Starting the Application

**CRITICAL**: Both servers must run simultaneously for full functionality:

1. **Backend**: `cd backend && python app.py` (port 5000)
2. **Frontend**: `npm run dev` (port 5173)
3. **Alternative**: Use `backend/start_server.bat` for Windows environment setup

### Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint checking

### NASA Data Integration

- **API Client**: `backend/services/nasa_api.py` queries NASA Exoplanet Archive
- **Caching System**: Local JSON files in `backend/data/` for performance
- **Data Processing**: Statistical analysis in `backend/services/data_processor.py`
- **React Integration**: `src/services/api.js` connects to Flask API endpoints

## Code Conventions

### Component Structure

- Each component has its own directory with `.jsx` and `.css` files
- Example: `components/header/header.jsx` + `components/header/header.css`
- Use React functional components with hooks

### Hybrid Routing Pattern

- **React Routes** (`App.jsx`): Landing page components and blog system
- **Flask Routes** (`backend/app.py`): Data APIs + server-rendered visualization pages
- **Cross-Integration**: React pages fetch data via `apiService` from Flask backend
- Example: `starmap.jsx` uses `apiService.getNearbyStars()` to get Flask API data

### Animation Patterns

- Custom `AnimatedNumber` component for digit-by-digit number reveals
- Uses `useState` and `useEffect` with timeouts for staggered animations
- Framer Motion for page transitions and complex animations

### Navigation

- `useNavigate()` hook for programmatic navigation
- Example: `const navigate = useNavigate(); navigate("/starmap");`
- Header contains main navigation with anchor links

## Key Features & Pages

### Star Map (`/starmap`)

- Uses `StarryBackground` component for animated star field
- Semi-transparent feature cards with backdrop blur effects
- Overlay content with `absolute` positioning and z-index layering

### Features Component

- Animated statistics display with staggered number reveals
- Grid layout for feature cards
- Navigation handlers for different exploration modes

## Unified Styling System

### CSS Variables (Consistent Across Frontend & Backend)

- **Primary Colors**: `--color-dark-blue: #0A0D1F`, `--color-text-white: #FFFFFF`, `--color-button: #007bff`
- **Background Pattern**: Space gradient `linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)`
- **Glass Effects**: `backdrop-filter: blur(10px)` with `rgba(10,13,31,0.85)` backgrounds

### Frontend React Styling

- **CSS Variables**: Defined in component CSS files (e.g., `header.css`, `feature.css`)
- **Inline Styles**: Used in JSX for dynamic components (e.g., `starmap.jsx`)
- **Component Pattern**: Each component folder contains `.jsx` + `.css` files

### Backend Flask Styling

- **Unified CSS**: `backend/static/css/style.css` serves all HTML templates
- **Navigation**: Matches React navbar with same logoContainer, logoCircle patterns
- **Template Structure**: Uses same CSS variable system as React components

### Critical Styling Alignment

- **Navbar**: Both use `.logoContainer`, `.logoCircle`, `.navLinks` classes
- **Cards**: Semi-transparent backgrounds with `rgba(10,13,31,0.85)` and blur effects
- **Buttons**: Consistent `#007bff` primary color with hover states
- **Typography**: Space theme with white text on dark gradients

### Unified CSS Implementation

- **Shared Variables**: `src/styles/variables.css` & `backend/static/css/variables.css` (identical files)
- **Utility Classes**: `.glass-card`, `.primary-button`, `.navbar-unified` available in both stacks
- **Import Pattern**: React components import `../../styles/variables.css`, backend templates link to `variables.css`
- **CSS Structure**: Variables first, then component-specific styles, eliminates duplicate definitions

## Assets & Public Files

- Logo: `src/assets/exo-logo.png`
- Background images in `public/`: earth.png, galaxy.png, mountains.png, night.jpg, sky.png
- Standard favicon and Vite assets

## Critical Integration Points

### API Service Pattern (`src/services/api.js`)

- Axios instance with `BASE_URL: 'http://localhost:5000/api'`
- All backend communication goes through `apiService` object
- Handles timeouts, error logging, and response formatting
- Example: `await apiService.getExoplanets(limit)` → `GET /api/exoplanets?limit=X`

### Data Flow Architecture

1. **NASA API** → `nasa_api.py` → **Local Cache** (`backend/data/*.json`)
2. **Cache** → `data_processor.py` → **Statistical Analysis**
3. **Flask API** → `api.js` → **React Components**
4. **Flask Templates** serve complex visualizations independently
5. **Radial Velocity** → `radial_velocity.py` → **ML Analysis & Predictions**

## Key Features & Pages

### Radial Velocity Analysis (`/radial-velocity`)

- **React Component**: `radialvelocity.jsx` for modern UI and basic analysis
- **Flask Template**: `radial_velocity.html` for advanced analysis with Plotly visualizations
- **Backend Service**: `radial_velocity.py` implements Lomb-Scargle periodogram, Keplerian fitting
- **API Endpoints**: `/api/rv/*` for dataset generation, analysis, and ML predictions
- **Method**: Detects exoplanets through stellar wobble measurements and Doppler shifts

### Development Dependencies

- **Backend**: Flask, requests, pandas, numpy, scikit-learn, scipy (see `backend/requirements.txt`)
- **Frontend**: React 19, Axios, Three.js, Framer Motion (see `package.json`)
- Both stacks must be running for full functionality

## Machine Learning Integration

### Radial Velocity Prediction Pipeline

- **Synthetic Data Generation**: Creates realistic RV datasets with known planet parameters
- **Periodogram Analysis**: Uses Lomb-Scargle algorithm for period detection
- **Orbital Fitting**: Implements weighted least-squares Keplerian model fitting
- **Planet Property Estimation**: Calculates minimum mass, semi-major axis, equilibrium temperature
- **Statistical Validation**: False alarm probability and fit quality metrics

When working on this project, maintain the hybrid architecture pattern, ensure both servers run for testing, follow the established NASA data caching system, and use the radial velocity service for exoplanet detection analysis.
