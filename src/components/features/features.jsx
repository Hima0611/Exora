import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from '../../services/api';

import './feature.css';

 const AnimatedNumber = ({ number, delay = 0 }) => {
  const digits = number.toString().split("");
  const [visibleDigits, setVisibleDigits] = useState([]);

  useEffect(() => { 
    setVisibleDigits([]); 
    const timers = [];
    digits.forEach((digit, index) => {
      const timer = setTimeout(() => {
        setVisibleDigits((prev) => [...prev, digit]);
      }, delay + index * 150); 
      timers.push(timer);
    });
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [number, delay, digits.length]);

  return (
    <h2 className="animatedNumber">
      {visibleDigits.map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </h2>
  );
};


const Features = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    confirmedExoplanets: 6013,
    hostStars: 10,
    discoveryMethods: 11
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [discoveryStats, discoveryMethods] = await Promise.all([
          apiService.getDiscoveryStats(),
          apiService.getDiscoveryMethods()
        ]);
        
        setStats({
          confirmedExoplanets: discoveryStats.total_exoplanets || 6013,
          hostStars: discoveryStats.total_host_stars || 10,
          discoveryMethods: discoveryMethods.length || 11
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExploreStars = () => window.location.href = "http://localhost:5000/starmap";
  const handleViewTrends = () => window.location.href = "http://localhost:5000/discovery-trends";
  const handleViewOrbits = () => window.location.href = "http://localhost:5000/orbital-viewer";
  const handleExplorePlanets = () => window.location.href = "http://localhost:5000/planet-explorer";

  return (
    
    <div className="featuresWrapper">
   {/* SECTION 1: NUMBER STATS */}
      <section className="numberSection">
        <div className="container numberGrid">
          <div className="numberCard">
            <AnimatedNumber number={stats.confirmedExoplanets} delay={200} />
            <b><p>Confirmed Exoplanets</p></b>
          </div>
          <div className="numberCard">
            <AnimatedNumber number={stats.hostStars} delay={200} />
            <b><p>Host Stars</p></b>
          </div>
          <div className="numberCard">
            <AnimatedNumber number={stats.discoveryMethods} delay={400} />
            <b><p>Discovery Methods</p></b>
          </div>
        </div>
      </section>
      
     
{/* SECTION 2: COSMIC CURIOSITY */}
<section className="curiositySection">
  <div className="container">
    <h2 className="sectionTitle">OUR COSMIC CURIOSITY</h2>
    
    <b><p className="introText">
      Through captivating stories, scientific insights, and futuristic visions,
      we take you across the cosmos to explore the most exciting mysteries of
      space.
    </p></b>

    <div className="featureCards">
      <div className="card">
        <div className="iconPlaceholder">✨</div>
        <h3>Interactive Star Map</h3>
        <p>Explore stars and exoplanets in a 3D interactive map.</p>
        <button className="learnMoreBtn" onClick={handleExploreStars}>Explore Stars</button>
      </div>

      <div className="card">
        <div className="iconPlaceholder">🪐</div>
        <h3>Discovery Trends</h3>
        <p>Analyze trends in exoplanet discoveries over time.</p>
        <button className="learnMoreBtn" onClick={handleViewTrends}>View Trends</button>
      </div>

      <div className="card">
        <div className="iconPlaceholder">🌍</div>
        <h3>3D Orbital Viewer</h3>
        <p>Visualize planetary orbits with stunning 3D animations.</p>
        <button className="learnMoreBtn" onClick={handleViewOrbits}>View Orbits</button>
      </div>

      <div className="card">
        <div className="iconPlaceholder">🔭</div>
        <h3>Planet Explorer</h3>
        <p>Navigate through a rich database of exoplanets and their characteristics.</p>
        <button className="learnMoreBtn" onClick={handleExplorePlanets}>Explore Planets</button>
      </div>
    </div>
  </div>
</section>


      {/* SECTION 3: SCIENCE MEETS WONDER */}
      <section className="wonderSection">
        <div className="container">
          <div className="textContent">
            <h2 className="sectionTitle">WHERE SCIENCE MEETS WONDER</h2>
            <p className="introText">
              We believe that the universe is a source of endless fascination. Our goal is to make complex science accessible
              and ignite the wonder in everyone. Uncover the mysteries of space through science, stories, and discoveries that
              will inspire curiosity and spark imagination.
            </p>
            <button className="primaryBtn">Learn More</button>
          </div>
          
          <div className="visualCluster">
            {/* Placeholders for the complex overlapping images */}
            <div className="mainGalaxyImg"></div>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
