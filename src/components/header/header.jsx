import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StarryBackground from "../starrybg/starrybackground";
import "../../styles/header.css";
import "../../styles/variables.css";
import exoLogo from "../../assets/exo-logo.png";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const goToBlogs = () => {
    navigate("/blog");
  };

  return (
    <header className={isHomePage ? "heroSection" : "heroSectioncompact"}>
      <StarryBackground />
      <nav className="navbar">
        <div className="logoContainer">
          <div className="logoCircle">
            <img src={exoLogo} alt="Logo" className="logo" />
          </div>
          <div className="logoSlogan"> Exora - EXPLORING PATHWAYS BEYOND</div>
        </div>
        <ul className="navLinks">
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="http://localhost:5000/starmap">Star Map</a>
          </li>
          <li>
            <a href="http://localhost:5000/discovery-trends">
              Discovery Trends
            </a>
          </li>
          <li>
            <a href="http://localhost:5000/orbital-viewer">Orbital Viewer</a>
          </li>
          <li>
            <a href="http://localhost:5000/planet-explorer">Planet Explorer</a>
          </li>
          <li>
            <a href="/radial-velocity">RV Analysis</a>
          </li>
          <li>
            <a className="subscribeBtnNav" href="#subscribe">
              Subscribe
            </a>
          </li>
        </ul>
      </nav>

      {isHomePage && (
        <>
          <div className="heroContent">
            <center>
              <h1 className="mainTitle">EXPLORING THE GREAT UNKNOWN</h1>
              <button className="primaryBtn" onClick={goToBlogs}>
                READ BLOGS
              </button>
            </center>
          </div>
          <div className="whiteSection"></div>
        </>
      )}
    </header>
  );
};

export default Header;
