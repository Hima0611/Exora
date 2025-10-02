import React, { useState, useEffect } from "react";
import StarryBackground from "../starrybg/starrybackground.jsx";
import { apiService } from '../../services/api';

const StarMap = () => {
  const [stars, setStars] = useState([]);
  const [exoplanets, setExoplanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nearbyStars, exoplanetData] = await Promise.all([
          apiService.getNearbyStars(50), // Within 50 parsecs
          apiService.getExoplanets(50)   // Get 50 exoplanets
        ]);
        
        setStars(nearbyStars || []);
        setExoplanets(exoplanetData || []);
      } catch (error) {
        console.error('Error fetching star map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStarClick = async (starName) => {
    try {
      const starInfo = await apiService.getStarInfo(starName);
      setSelectedStar(starInfo);
    } catch (error) {
      console.error('Error fetching star info:', error);
    }
  };

  return (
    <div className="starMapPage relative w-full h-screen overflow-hidden">
      {/* Starry background */}
      <StarryBackground />

      {/* Foreground content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl mb-4">🌌 Star Map</h1>
        <p className="mb-8">Navigate through {exoplanets.length} exoplanets around {stars.length} nearby stars.</p>

        {/* Semi-transparent Feature Card */}
        <div style={{
          position: 'relative',
          width: '75%',
          maxWidth: '600px',
          background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: '#FFFFFF' }}>✨ Interactive Star Map ✨</h2>
          {loading ? (
            <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Loading astronomical data...</p>
          ) : (
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p>Explore {exoplanets.length} confirmed exoplanets</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Data from NASA Exoplanet Archive
              </p>
            </div>
          )}
          <button 
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            onClick={() => setSelectedStar(null)}
          >
            {selectedStar ? 'Close Details' : 'Explore Features'}
          </button>
        </div>

        {/* Star Data Visualization */}
        <div className="starMapContainer relative z-10 w-full h-full mt-12 max-w-4xl">
          {!loading && exoplanets.slice(0, 10).map((planet, index) => (
            <div 
              key={planet.pl_name || index}
              className="star cursor-pointer hover:scale-150 transition-transform" 
              style={{ 
                position: "absolute", 
                top: `${20 + (index * 7)}%`, 
                left: `${30 + (index * 6)}%`,
                fontSize: index % 3 === 0 ? '24px' : '18px'
              }}
              onClick={() => handleStarClick(planet.hostname)}
              title={`${planet.pl_name} orbiting ${planet.hostname}`}
            >
              {index % 3 === 0 ? '🌟' : index % 2 === 0 ? '⭐' : '✨'}
            </div>
          ))}
        </div>

        {/* Selected Star Details */}
        {selectedStar && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            background: 'linear-gradient(145deg, rgba(10,13,31,0.9), rgba(10,13,31,0.7))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#FFFFFF',
            maxHeight: '12rem',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#007bff' }}>{selectedStar.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <p><strong>Distance:</strong> {selectedStar.distance} parsecs</p>
              <p><strong>Planets:</strong> {selectedStar.planet_count || 'Unknown'}</p>
              <p><strong>Type:</strong> {selectedStar.stellar_type || 'Unknown'}</p>
              <p><strong>Coordinates:</strong> RA {selectedStar.ra}°, Dec {selectedStar.dec}°</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StarMap;
