import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../header/header";
import "../../styles/variables.css";
import "../../styles/radialvelocity.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

// Separate chart component to prevent canvas reuse issues
const SafeLineChart = ({ data, options, height, chartId }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !data) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Destroy any existing chart on the canvas
    let existingChart = ChartJS.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // Create a new chart instance
    const chart = new ChartJS(ctx, {
      type: "line",
      data: data,
      options: {
        ...options,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          onComplete: () => {},
        },
        devicePixelRatio: window.devicePixelRatio || 1,
      },
    });

    // Cleanup function to destroy the chart on unmount or re-render
    return () => {
      chart.destroy();
    };
  }, [data, options, chartId]); // Re-run effect if data, options, or key changes

  if (!data) return null;

  return (
    <div
      className="chart-wrapper"
      style={{ position: "relative", height: height }}
    >
      <canvas ref={canvasRef} id={chartId}></canvas>
    </div>
  );
};

// Original component with potential infinite re-render issue
const RadialVelocityAnalysisOriginal = () => {
  const [currentData, setCurrentData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState("jupiter");
  const [numPoints, setNumPoints] = useState(150);
  const [stellarMass, setStellarMass] = useState(1.0);
  const [error, setError] = useState(null);

  // Generate synthetic dataset (memoized to prevent re-creation on every render)
  const generateDataset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/rv/generate-dataset?type=${selectedDataset}&points=${numPoints}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        setError("Error generating dataset: " + data.error);
        return;
      }

      setCurrentData(data);
      setAnalysisResults(null); // Clear previous results
    } catch (error) {
      setError("Error generating dataset: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDataset, numPoints]);

  // Analyze radial velocity data (memoized to prevent re-creation on every render)
  const analyzeData = useCallback(async () => {
    if (!currentData) {
      setError("Please generate or load data first.");
      return;
    }

    // Validate data integrity
    if (!currentData.time || !currentData.rv || !currentData.rv_error) {
      setError("Invalid dataset: missing required fields");
      return;
    }

    if (
      currentData.time.length !== currentData.rv.length ||
      currentData.time.length !== currentData.rv_error.length
    ) {
      setError("Invalid dataset: arrays have different lengths");
      return;
    }

    // Data validation passed, proceeding with analysis

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/rv/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: currentData.time,
          rv: currentData.rv,
          rv_error: currentData.rv_error,
          stellar_mass: stellarMass,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const results = await response.json();

      if (results.error) {
        setError("Analysis Error: " + results.error);
        return;
      }

      setAnalysisResults(results);
    } catch (error) {
      setError("Error analyzing data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentData, stellarMass]);

  // Calculate basic statistics for current data (simplified to debug infinite re-renders)
  const stats = useMemo(() => {
    console.log(
      "Stats calculation called",
      currentData ? "with data" : "without data"
    );
    if (!currentData || !currentData.rv) return {};

    const rvValues = currentData.rv;
    const mean = rvValues.reduce((a, b) => a + b, 0) / rvValues.length;
    const variance =
      rvValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rvValues.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...rvValues);
    const max = Math.max(...rvValues);

    return { mean, stdDev, min, max, range: max - min };
  }, [currentData]);

  // Initialize component on mount - simplified to avoid infinite loops
  useEffect(() => {
    console.log("RadialVelocity useEffect called");
    // Don't auto-generate data on mount to avoid potential issues
    // User can click "Generate Dataset" button instead
  }, []);

  return (
    <div className="radialVelocityPage">
      {/* Starry background - temporarily removed for debugging */}
      {/* <StarryBackground /> */}
      <Header />

      {/* Foreground content */}
      <div className="rvContent">
        {/* Header */}
        <div className="rvHeader fadeInUp">
          <h1 className="rvTitle">
            <span className="emoji">🔬</span> Radial Velocity Detection
          </h1>
          <p className="rvSubtitle">
            Detect and analyze exoplanets using the radial velocity method with
            advanced machine learning predictions and real-time data
            visualization
          </p>
        </div>

        {/* Controls Panel */}
        <div className="rvCard fadeInUp">
          {loading && (
            <div className="loadingOverlay">
              <div className="loadingSpinner"></div>
            </div>
          )}

          <h3 className="rvCardTitle">
            <span className="emoji">📊</span>
            Dataset & Analysis Controls
          </h3>

          <div className="controlsGrid">
            <div className="controlGroup">
              <label className="controlLabel">Dataset Type:</label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="controlInput"
              >
                <option value="jupiter">Jupiter-like Planet</option>
                <option value="earth">Earth-like Planet</option>
                <option value="noise">No Planet (Noise Only)</option>
              </select>
            </div>

            <div className="controlGroup">
              <label className="controlLabel">Data Points:</label>
              <input
                type="number"
                value={numPoints}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setNumPoints(value);
                  }
                }}
                min="50"
                max="500"
                className="controlInput"
                placeholder="150"
              />
            </div>

            <div className="controlGroup">
              <label className="controlLabel">Stellar Mass (M☉):</label>
              <input
                type="number"
                value={stellarMass}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setStellarMass(value);
                  }
                }}
                step="0.1"
                min="0.1"
                max="5.0"
                className="controlInput"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="buttonGroup">
            <button
              className="rvButton"
              onClick={generateDataset}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Dataset"}
            </button>

            <button
              className="rvButton"
              onClick={analyzeData}
              disabled={loading || !currentData}
            >
              {loading ? "Analyzing..." : "Analyze Data"}
            </button>
          </div>

          {error && <div className="errorMessage">{error}</div>}
        </div>

        {/* Data Visualization */}
        {currentData && (
          <div className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">📈</span>
              Radial Velocity Data Plot
            </h3>
            <div className="visualizationContainer">
              <div className="chartContainer">
                <svg
                  width="100%"
                  height="300"
                  viewBox="0 0 800 300"
                  className="rvChart"
                >
                  <defs>
                    <linearGradient
                      id="rvGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                      <stop
                        offset="100%"
                        stopColor="#60a5fa"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <defs>
                    <pattern
                      id="grid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        className="chartGrid"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Axes */}
                  <line
                    x1="50"
                    y1="250"
                    x2="750"
                    y2="250"
                    className="chartAxis"
                  />
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="250"
                    className="chartAxis"
                  />

                  {/* Plot RV data points */}
                  {currentData.time.slice(0, 150).map((time, index) => {
                    const x = (time / Math.max(...currentData.time)) * 700 + 50;
                    const rvRange =
                      Math.max(...currentData.rv) - Math.min(...currentData.rv);
                    const y =
                      250 -
                      ((currentData.rv[index] - Math.min(...currentData.rv)) /
                        rvRange) *
                        200;

                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="2.5"
                        className="dataPoint"
                        opacity="0.8"
                      />
                    );
                  })}

                  {/* True signal line if available */}
                  {currentData.true_signal && (
                    <path
                      d={currentData.time
                        .slice(0, 150)
                        .map((time, index) => {
                          const x =
                            (time / Math.max(...currentData.time)) * 700 + 50;
                          const rvRange =
                            Math.max(...currentData.rv) -
                            Math.min(...currentData.rv);
                          const y =
                            250 -
                            ((currentData.true_signal[index] +
                              Math.min(...currentData.rv) -
                              Math.min(...currentData.rv)) /
                              rvRange) *
                              200;
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      stroke="#34d399"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.8"
                    />
                  )}

                  {/* Axis labels */}
                  <text
                    x="400"
                    y="285"
                    textAnchor="middle"
                    className="chartText"
                  >
                    Time (days)
                  </text>
                  <text
                    x="25"
                    y="150"
                    textAnchor="middle"
                    className="chartText"
                    transform="rotate(-90 25 150)"
                  >
                    RV (m/s)
                  </text>
                </svg>
              </div>

              <div className="statsGrid">
                <div className="statItem">
                  <div className="statValue">{currentData.time.length}</div>
                  <div className="statLabel">Data Points</div>
                </div>
                <div className="statItem">
                  <div className="statValue">
                    {Math.max(...currentData.rv).toFixed(1)}
                  </div>
                  <div className="statLabel">Max RV (m/s)</div>
                </div>
                <div className="statItem">
                  <div className="statValue">
                    {Math.min(...currentData.rv).toFixed(1)}
                  </div>
                  <div className="statLabel">Min RV (m/s)</div>
                </div>
                <div className="statItem">
                  <div className="statValue">
                    {(
                      Math.max(...currentData.rv) - Math.min(...currentData.rv)
                    ).toFixed(1)}
                  </div>
                  <div className="statLabel">RV Range (m/s)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="resultsSection">
          {/* Dataset Summary */}
          <div className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">📊</span>
              Dataset Summary
            </h3>
            {currentData ? (
              <div>
                <div className="statsGrid">
                  <div className="statItem">
                    <div className="statValue">{currentData.time.length}</div>
                    <div className="statLabel">Observations</div>
                  </div>
                  <div className="statItem">
                    <div className="statValue">
                      {(
                        Math.max(...currentData.time) -
                        Math.min(...currentData.time)
                      ).toFixed(1)}
                    </div>
                    <div className="statLabel">Time Span (days)</div>
                  </div>
                  <div className="statItem">
                    <div className="statValue">
                      {stats.mean?.toFixed(2) || "N/A"}
                    </div>
                    <div className="statLabel">RV Mean (m/s)</div>
                  </div>
                  <div className="statItem">
                    <div className="statValue">
                      {stats.stdDev?.toFixed(2) || "N/A"}
                    </div>
                    <div className="statLabel">RV Std Dev (m/s)</div>
                  </div>
                </div>

                <div className="resultValue">
                  <span className="resultLabel">Dataset Type:</span>{" "}
                  {selectedDataset}
                </div>
                {currentData.parameters && (
                  <div className="resultValue">
                    <span className="resultLabel">Has Planet:</span>
                    {currentData.parameters.has_planet ? " ✅ Yes" : " ❌ No"}
                  </div>
                )}
              </div>
            ) : (
              <div className="resultValue">
                <span className="resultLabel">Status:</span> No dataset loaded
              </div>
            )}
          </div>

          {/* Analysis Results */}
          <div className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">🎯</span>
              Analysis Results
            </h3>
            {analysisResults ? (
              <div>
                {analysisResults.detection_status === "planet_detected" ? (
                  <div className="successMessage">
                    <div className="resultTitle">
                      <span>✅</span> Planet Detected!
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">Period:</span>
                      {analysisResults.analysis_summary.period_days.toFixed(
                        2
                      )}{" "}
                      days
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">RV Amplitude:</span>
                      {analysisResults.analysis_summary.rv_amplitude_ms.toFixed(
                        2
                      )}{" "}
                      m/s
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">Min Mass:</span>
                      {analysisResults.planet_properties.minimum_mass_earth.toFixed(
                        2
                      )}{" "}
                      M⊕
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">Semi-major Axis:</span>
                      {analysisResults.planet_properties.semi_major_axis_au.toFixed(
                        3
                      )}{" "}
                      AU
                    </div>
                  </div>
                ) : (
                  <div className="errorMessage">
                    <div className="resultTitle">
                      <span>❌</span> No Planet Detected
                    </div>
                    <div className="resultValue">
                      The analysis did not find a significant periodic signal
                      indicating an exoplanet.
                    </div>
                  </div>
                )}

                {/* Periodogram Results */}
                {analysisResults.periodogram && (
                  <div
                    className="visualizationContainer"
                    style={{ marginTop: "1rem" }}
                  >
                    <h4 className="resultTitle">
                      <span className="emoji">📊</span>
                      Periodogram Analysis
                    </h4>
                    <div className="chartContainer" style={{ height: "200px" }}>
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 150"
                        className="rvChart"
                      >
                        {/* Grid lines */}
                        <defs>
                          <pattern
                            id="periodogramGrid"
                            width="40"
                            height="30"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M 40 0 L 0 0 0 30"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#periodogramGrid)"
                        />

                        {/* Axes */}
                        <line
                          x1="25"
                          y1="130"
                          x2="375"
                          y2="130"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1"
                        />
                        <line
                          x1="25"
                          y1="30"
                          x2="25"
                          y2="130"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="1"
                        />

                        {/* Periodogram data */}
                        {analysisResults.periodogram.periods &&
                          (() => {
                            // Sort periods and corresponding power values for proper display
                            const periodPowerPairs =
                              analysisResults.periodogram.periods
                                .map((period, index) => ({
                                  period: period,
                                  power:
                                    analysisResults.periodogram.power[index],
                                }))
                                .sort((a, b) => a.period - b.period)
                                .slice(0, 100); // Show more points for better resolution

                            const maxPower = Math.max(
                              ...periodPowerPairs.map((p) => p.power)
                            );
                            const minPeriod = Math.min(
                              ...periodPowerPairs.map((p) => p.period)
                            );
                            const maxPeriod = Math.max(
                              ...periodPowerPairs.map((p) => p.period)
                            );

                            return periodPowerPairs.map((item, index) => {
                              const x =
                                25 +
                                ((item.period - minPeriod) /
                                  (maxPeriod - minPeriod)) *
                                  350;
                              const height = (item.power / maxPower) * 100;
                              const y = 130 - height;
                              const isBestPeriod =
                                Math.abs(
                                  item.period -
                                    analysisResults.periodogram.best_period
                                ) < 2;

                              return (
                                <g key={index}>
                                  <line
                                    x1={x}
                                    y1="130"
                                    x2={x}
                                    y2={y}
                                    stroke={
                                      isBestPeriod ? "#fbbf24" : "#60a5fa"
                                    }
                                    strokeWidth={isBestPeriod ? "3" : "1.5"}
                                    opacity="0.8"
                                  />
                                  {isBestPeriod && (
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="3"
                                      fill="#fbbf24"
                                      stroke="#fff"
                                      strokeWidth="1"
                                    />
                                  )}
                                </g>
                              );
                            });
                          })()}

                        {/* Axis labels */}
                        <text
                          x="200"
                          y="145"
                          textAnchor="middle"
                          className="chartText"
                        >
                          Period (days)
                        </text>
                        <text
                          x="15"
                          y="80"
                          textAnchor="middle"
                          className="chartText"
                          transform="rotate(-90 15 80)"
                        >
                          Power
                        </text>

                        {/* Best period marker */}
                        {analysisResults.periodogram.best_period && (
                          <text
                            x="200"
                            y="20"
                            textAnchor="middle"
                            className="chartText"
                            fill="#fbbf24"
                            fontSize="11"
                          >
                            Best:{" "}
                            {analysisResults.periodogram.best_period.toFixed(1)}
                            d
                          </text>
                        )}
                      </svg>
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">Best Period:</span>
                      {analysisResults.periodogram.best_period?.toFixed(2)} days
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">Peak Power:</span>
                      {analysisResults.periodogram.peak_power?.toFixed(3)}
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">False Alarm Prob:</span>
                      {analysisResults.periodogram.false_alarm_probability?.toFixed(
                        6
                      )}
                    </div>
                    <div className="resultValue">
                      <span className="resultLabel">
                        Significant Detection:
                      </span>
                      {analysisResults.periodogram.significant_detection
                        ? "✅ Yes"
                        : "❌ No"}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="resultValue">
                <span className="resultLabel">Status:</span> Click "Analyze
                Data" to run detection analysis
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="rvCard fadeInUp">
          <h3 className="rvCardTitle">
            <span className="emoji">📚</span>
            About the Radial Velocity Method
          </h3>
          <div className="resultsSection">
            <div>
              <h4 className="resultTitle">How It Works</h4>
              <p className="resultValue">
                The radial velocity method detects exoplanets by measuring the
                tiny wobbles in a star's motion caused by the gravitational pull
                of orbiting planets. As the planet orbits, it causes the star to
                move in a small circle, creating periodic Doppler shifts in the
                star's spectrum.
              </p>
            </div>
            <div>
              <h4 className="resultTitle">Analysis Process</h4>
              <div className="resultValue">
                <div>
                  1. <strong>Data Collection:</strong> Precise radial velocity
                  measurements over time
                </div>
                <div>
                  2. <strong>Periodogram Analysis:</strong> Search for periodic
                  signals using Lomb-Scargle method
                </div>
                <div>
                  3. <strong>Orbital Fitting:</strong> Fit Keplerian orbital
                  models to detected periods
                </div>
                <div>
                  4. <strong>Planet Properties:</strong> Calculate mass, orbital
                  distance, and temperature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadialVelocityAnalysisOriginal;
