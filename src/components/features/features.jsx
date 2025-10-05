/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import "../../styles/variables.css";
import "../../styles/feature.css";

const AnimatedNumber = ({ number, delay = 0 }) => {
  const digits = number.toString().split("");
  const [visibleDigits, setVisibleDigits] = useState([]);

  useEffect(() => {
    setVisibleDigits([]);
    console.log(digits);
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
    discoveryMethods: 11,
  });
  // Fetch real data from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [discoveryStats, discoveryMethods] = await Promise.all([
          apiService.getDiscoveryStats(),
          apiService.getDiscoveryMethods(),
        ]);

        setStats({
          confirmedExoplanets: discoveryStats.total_exoplanets || 6013,
          hostStars: discoveryStats.total_host_stars || 10,
          discoveryMethods: discoveryMethods.length || 11,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Keep default values if API fails
      }
    };

    fetchStats();
  }, []);

  const Url = "https://exora-yrj4.onrender.com/";
  const handleRadialVelocity = () => navigate("/radial-velocity");
  const handleExploreStars = () =>
    (window.location.href = `${Url}/starmap`);
  const handleViewTrends = () =>
    (window.location.href = `${Url}/discovery-trends`);
  const handleViewOrbits = () =>
    (window.location.href = `${Url}/orbital-viewer`);
  const handleExplorePlanets = () =>
    (window.location.href = `${Url}/planet-explorer`);
  const handleAIPredict = () =>
    (window.location.href = `${Url}/predict`);
  const handleKnowledge = () => {
    navigate("/knowledge");
  };

  return (
    <div className="featuresWrapper">
      {/* SECTION 1: NUMBER STATS */}
      <section className="numberSection">
        <div className="container numberGrid">
          <div className="numberCard">
            <AnimatedNumber number={stats.confirmedExoplanets} delay={200} />
            <b>
              <p>Confirmed Exoplanets</p>
            </b>
          </div>
          <div className="numberCard">
            <AnimatedNumber number={stats.hostStars} delay={200} />
            <b>
              <p>Host Stars</p>
            </b>
          </div>
          <div className="numberCard">
            <AnimatedNumber number={stats.discoveryMethods} delay={400} />
            <b>
              <p>Discovery Methods</p>
            </b>
          </div>
        </div>
      </section>

      {/* SECTION 2: COSMIC CURIOSITY */}
      <section className="curiositySection">
        <div className="container">
          <h2 className="sectionTitle">OUR COSMIC CURIOSITY</h2>

          <b>
            <p className="introText">
              Through captivating stories, scientific insights, and futuristic
              visions, we take you across the cosmos to explore the most
              exciting mysteries of space.
            </p>
          </b>

          <div className="featureCards">
            <div className="card glass-card">
              <div className="iconPlaceholder">✨</div>
              <h3>Interactive Star Map</h3>
              <p>Explore stars and exoplanets in a 3D interactive map.</p>
              <button
                className="learnMoreBtn primary-button"
                onClick={handleExploreStars}
              >
                Explore Stars
              </button>
            </div>

            <div className="card glass-card">
              <div className="iconPlaceholder">🪐</div>
              <h3>Discovery Trends</h3>
              <p>Analyze trends in exoplanet discoveries over time.</p>
              <button
                className="learnMoreBtn primary-button"
                onClick={handleViewTrends}
              >
                View Trends
              </button>
            </div>

            <div className="card glass-card">
              <div className="iconPlaceholder">🌍</div>
              <h3>3D Orbital Viewer</h3>
              <p>Visualize planetary orbits with stunning 3D animations.</p>
              <button
                className="learnMoreBtn primary-button"
                onClick={handleViewOrbits}
              >
                View Orbits
              </button>
            </div>

            <div className="card glass-card">
              <div className="iconPlaceholder">🔭</div>
              <h3>Planet Explorer</h3>
              <p>
                Navigate through a rich database of exoplanets and their
                characteristics.
              </p>
              <button
                className="learnMoreBtn primary-button"
                onClick={handleExplorePlanets}
              >
                Explore Planets
              </button>
            </div>

            <div className="card glass-card">
              <div className="iconPlaceholder">🔮</div>
              <h3>AI Prediction</h3>
              <p>
                Use machine learning to predict exoplanet classifications and
                probabilities.
              </p>
              <button
                className="learnMoreBtn primary-button"
                onClick={handleAIPredict}
              >
                Predict Now
              </button>
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
              We believe that the universe is a source of endless fascination.
              Our goal is to make complex science accessible and ignite the
              wonder in everyone. Uncover the mysteries of space through
              science, stories, and discoveries that will inspire curiosity and
              spark imagination.
            </p>
            <button
              className="primaryBtn primary-button"
              onClick={handleKnowledge}
            >
              Learn More
            </button>
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
