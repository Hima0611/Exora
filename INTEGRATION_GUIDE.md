# Exora Full Stack Configuration

## Running the Complete Application

### 1. Start Backend (Flask API + HTML Pages)
```bash
cd "C:\Users\HP\OneDrive\Desktop\backend\backend"
python app.py
```
Backend will run on: http://localhost:5000/

### 2. Start Frontend (React Landing Page)
```bash
cd "C:\Users\HP\OneDrive\Desktop\Nasa\Exora"
npm run dev
```
Frontend will run on: http://localhost:5173/

## Application Architecture

### React Frontend (Port 5173)
- **Main Landing Page**: http://localhost:5173/
- **Features**: Real-time NASA data integration
- **Navigation**: Links to backend specialized pages

### Flask Backend (Port 5000) 
- **API Endpoints**: http://localhost:5000/api/*
- **Star Map**: http://localhost:5000/starmap
- **Discovery Trends**: http://localhost:5000/discovery-trends  
- **Orbital Viewer**: http://localhost:5000/orbital-viewer
- **Planet Explorer**: http://localhost:5000/planet-explorer

## Data Flow
1. **React App** displays landing page with real NASA statistics
2. **Navigation buttons** open specialized backend pages in new tabs
3. **Backend pages** provide full interactive features with NASA data
4. **API endpoints** supply real-time exoplanet data to both frontend and backend

## User Journey
1. Start at React landing page (http://localhost:5173/)
2. View animated statistics powered by NASA API
3. Click feature buttons to explore specialized tools
4. Each tool opens in new tab showing full backend functionality
5. Navigate back to main React app using "Back to Exora" links

This hybrid approach gives you:
- ✅ Modern React landing page with animations
- ✅ Full-featured backend visualization tools  
- ✅ Real NASA exoplanet data integration
- ✅ Seamless navigation between components