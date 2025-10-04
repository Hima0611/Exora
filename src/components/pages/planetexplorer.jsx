import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const PlanetExplorer = () => {
  const [exoplanets, setExoplanets] = useState([]);
  const [filteredPlanets, setFilteredPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    const fetchExoplanets = async () => {
      try {
        const data = await apiService.getExoplanets(200); // Get more planets for exploration
        setExoplanets(data || []);
        setFilteredPlanets(data || []);
      } catch (error) {
        console.error('Error fetching exoplanets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExoplanets();
  }, []);

  // Filter planets based on search and filter criteria
  useEffect(() => {
    let filtered = exoplanets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(planet => 
        planet.pl_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planet.hostname?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Discovery method filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(planet => 
        planet.discoverymethod?.toLowerCase() === filterBy.toLowerCase()
      );
    }

    setFilteredPlanets(filtered);
  }, [searchTerm, filterBy, exoplanets]);

  const handlePlanetClick = async (planet) => {
    setSelectedPlanet(planet);
  };

  const getPlanetSize = (radius) => {
    if (!radius) return 'Unknown';
    if (radius < 1.5) return 'Earth-like';
    if (radius < 4) return 'Neptune-like';
    return 'Jupiter-like';
  };

  const getPlanetTemperature = (temp) => {
    if (!temp) return 'Unknown';
    if (temp < 200) return 'Very Cold';
    if (temp < 300) return 'Cold';
    if (temp < 400) return 'Temperate';
    if (temp < 1000) return 'Hot';
    return 'Very Hot';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A0D1F 0%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            border: '2px solid transparent',
            borderBottom: '2px solid #FFFFFF',
            margin: '0 auto 1rem auto'
          }}></div>
          <p>Loading exoplanet database...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A0D1F 0%, #000000 100%)',
      color: '#FFFFFF'
    }}>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">🪐 Planet Explorer</h1>
        
        {/* Search and Filter Controls */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
          backdropFilter: 'blur(12px)',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search planets or host stars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#FFFFFF',
                fontSize: '1rem'
              }}
              className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/60"
            />
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
            >
              <option value="all">All Discovery Methods</option>
              <option value="transit">Transit</option>
              <option value="radial velocity">Radial Velocity</option>
              <option value="imaging">Direct Imaging</option>
              <option value="microlensing">Microlensing</option>
            </select>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-lg">
              Showing <span className="font-bold text-cyan-400">{filteredPlanets.length}</span> of{' '}
              <span className="font-bold">{exoplanets.length}</span> confirmed exoplanets
            </p>
          </div>
        </div>

        {/* Planet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredPlanets.slice(0, 20).map((planet, index) => (
            <div
              key={planet.pl_name || index}
              onClick={() => handlePlanetClick(planet)}
              className="bg-white/10 backdrop-blur-md rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-all hover:scale-105"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">
                  {getPlanetSize(planet.pl_rade) === 'Earth-like' ? '🌍' : 
                   getPlanetSize(planet.pl_rade) === 'Neptune-like' ? '🔵' : '🪐'}
                </div>
                <h3 className="font-bold text-lg truncate" title={planet.pl_name}>
                  {planet.pl_name || `Planet ${index + 1}`}
                </h3>
                <p className="text-sm opacity-80 truncate">
                  Host: {planet.hostname || 'Unknown'}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-cyan-400">{getPlanetSize(planet.pl_rade)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature:</span>
                  <span className="text-orange-400">{getPlanetTemperature(planet.pl_eqt)}K</span>
                </div>
                <div className="flex justify-between">
                  <span>Discovery:</span>
                  <span className="text-green-400">{planet.disc_year || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="text-purple-400 truncate">{planet.discoverymethod || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Planet Details Modal */}
        {selectedPlanet && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold">{selectedPlanet.pl_name}</h2>
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-cyan-400">Planet Properties</h3>
                  <div className="space-y-3">
                    <div><strong>Host Star:</strong> {selectedPlanet.hostname}</div>
                    <div><strong>Radius:</strong> {selectedPlanet.pl_rade ? `${selectedPlanet.pl_rade} Earth radii` : 'Unknown'}</div>
                    <div><strong>Mass:</strong> {selectedPlanet.pl_masse ? `${selectedPlanet.pl_masse} Earth masses` : 'Unknown'}</div>
                    <div><strong>Orbital Period:</strong> {selectedPlanet.pl_orbper ? `${selectedPlanet.pl_orbper} days` : 'Unknown'}</div>
                    <div><strong>Equilibrium Temperature:</strong> {selectedPlanet.pl_eqt ? `${selectedPlanet.pl_eqt} K` : 'Unknown'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-green-400">Discovery Info</h3>
                  <div className="space-y-3">
                    <div><strong>Discovery Year:</strong> {selectedPlanet.disc_year}</div>
                    <div><strong>Discovery Method:</strong> {selectedPlanet.discoverymethod}</div>
                    <div><strong>Distance:</strong> {selectedPlanet.sy_dist ? `${selectedPlanet.sy_dist} parsecs` : 'Unknown'}</div>
                    <div><strong>RA:</strong> {selectedPlanet.ra ? `${selectedPlanet.ra}°` : 'Unknown'}</div>
                    <div><strong>Dec:</strong> {selectedPlanet.dec ? `${selectedPlanet.dec}°` : 'Unknown'}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setSelectedPlanet(null)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanetExplorer;