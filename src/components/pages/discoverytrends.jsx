import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const DiscoveryTrends = () => {
  const [discoveryStats, setDiscoveryStats] = useState(null);
  const [discoveryMethods, setDiscoveryMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, methods] = await Promise.all([
          apiService.getDiscoveryStats(),
          apiService.getDiscoveryMethods()
        ]);
        
        setDiscoveryStats(stats);
        setDiscoveryMethods(methods);
      } catch (error) {
        console.error('Error fetching discovery trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <p>Loading discovery trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0A0D1F 0%, #000000 100%)',
      color: '#FFFFFF',
      padding: '2rem'
    }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">📊 Exoplanet Discovery Trends</h1>
        
        {/* Stats Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
            backdropFilter: 'blur(12px)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '0.5rem' }}>
              {discoveryStats?.total_exoplanets || 'N/A'}
            </h3>
            <p style={{ fontSize: '1.125rem' }}>Total Confirmed Exoplanets</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
            backdropFilter: 'blur(12px)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '0.5rem' }}>
              {discoveryStats?.total_host_stars || 'N/A'}
            </h3>
            <p style={{ fontSize: '1.125rem' }}>Host Stars</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
            backdropFilter: 'blur(12px)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '0.5rem' }}>
              {discoveryStats?.avg_discovery_year || 'N/A'}
            </h3>
            <p style={{ fontSize: '1.125rem' }}>Average Discovery Year</p>
          </div>
        </div>

        {/* Discovery Methods */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
          backdropFilter: 'blur(12px)',
          borderRadius: '15px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Discovery Methods</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {discoveryMethods.map((method, index) => (
              <div key={index} style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                border: '1px solid rgba(0, 123, 255, 0.3)'
              }}>
                <h3 style={{ fontWeight: '600', color: '#007bff', marginBottom: '0.5rem' }}>{method.method}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{method.count}</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>planets discovered</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline visualization placeholder */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(10,13,31,0.85), rgba(10,13,31,0.6))',
          backdropFilter: 'blur(12px)',
          borderRadius: '15px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Discovery Timeline</h2>
          <div style={{
            height: '16rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '10px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>📈 Interactive Timeline Coming Soon</p>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                This will show exoplanet discoveries over time with interactive charts
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '12px 32px',
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
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryTrends;