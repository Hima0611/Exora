import React from 'react';
import { useNavigate } from 'react-router-dom';
import './header.css';
import exoLogo from '../../assets/exo-logo.png'; 

const Header = () => {
  const navigate = useNavigate();
  
  const goToBlogs = () => {
    navigate("/blog"); 
  }
  
  return (
    <header className="heroSection">
      <nav className="navbar">
        <ul className="navLinks">
          <li><a href="/">Home</a></li>
          <li><a href="http://localhost:5000/starmap">Star Map</a></li>
          <li><a href="http://localhost:5000/discovery-trends">Discovery Trends</a></li>
          <li><a href="http://localhost:5000/orbital-viewer">Orbital Viewer</a></li>
          <li><a href="http://localhost:5000/planet-explorer">Planet Explorer</a></li>
          <li><a href="http://localhost:5000/predict">AI Predict</a></li>
        </ul>
      </nav>

      <div className="heroContent">
        <center>
        <h1 className="mainTitle">EXPLORING THE GREAT UNKNOWN</h1>
        <button className="primaryBtn" onClick={goToBlogs}>READ BLOGS</button>
        </center>
      </div>

      <div className="whiteSection"></div>

    </header>
  );
};

export default Header;
