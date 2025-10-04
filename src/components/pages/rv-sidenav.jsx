import React from "react";
import "./rv-sidenav.css";

const RVSideNav = () => {
  return (
    <nav className="rv-sidenav">
      <ul>
        <li>
          <a href="#controls">Controls</a>
        </li>
        <li>
          <a href="#dataset-stats">Dataset Stats</a>
        </li>
        <li>
          <a href="#rv-timeseries">RV Time Series</a>
        </li>
        <li>
          <a href="#periodogram">Periodogram</a>
        </li>
        <li>
          <a href="#results">Results</a>
        </li>
        <li>
          <a href="#about-rv">About</a>
        </li>
      </ul>
    </nav>
  );
};

export default RVSideNav;
