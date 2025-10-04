import React, { useState, useCallback, useMemo, useEffect } from "react";
import Header from "../header/header";
import RVSideNav from "./rv-sidenav";
import "../../styles/variables.css";
import "./radialvelocity.css";
import "./rv-sidenav.css";
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
import { Line } from "react-chartjs-2";

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

const RadialVelocityAnalysisWorking = () => {
  const [currentData, setCurrentData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState("jupiter");
  const [numPoints, setNumPoints] = useState(150);
  const [stellarMass, setStellarMass] = useState(1.0);
  const [downsamplePoints, setDownsamplePoints] = useState(500);
  const [error, setError] = useState(null);
  const [chartKey, setChartKey] = useState(0); // Force chart remount

  // Generate synthetic dataset (properly memoized)
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
      setAnalysisResults(null);
      // Force chart remount when new data is generated
      setChartKey((prev) => prev + 1);
    } catch (error) {
      setError("Error generating dataset: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDataset, numPoints]);

  // Analyze data (properly memoized)
  const analyzeData = useCallback(async () => {
    if (!currentData) {
      setError("Please generate or load data first.");
      return;
    }

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
          downsample_points: downsamplePoints,
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
      // Force chart remount to avoid canvas reuse issues
      setChartKey((prev) => prev + 1);
    } catch (error) {
      setError("Error analyzing data: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentData, stellarMass, downsamplePoints]);

  // Cleanup function to reset all active Chart.js instances when chartKey changes
  useEffect(() => {
    // This runs when chartKey changes or component unmounts
    return () => {
      // Force all Chart.js instances to be destroyed
      // This is a global cleanup for safety
      const chartInstances = Object.values(ChartJS.instances);
      if (chartInstances.length > 0) {
        chartInstances.forEach((chart) => {
          if (chart) chart.destroy();
        });
      }
    };
  }, [chartKey]);

  // Calculate stats (properly memoized)
  const stats = useMemo(() => {
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

  // Safe input handlers
  const handleNumPointsChange = useCallback((e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setNumPoints(value);
    }
  }, []);

  const handleStellarMassChange = useCallback((e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setStellarMass(value);
    }
  }, []);

  const handleDatasetChange = useCallback((e) => {
    setSelectedDataset(e.target.value);
  }, []);

  // Chart data for radial velocity time series
  const rvChartData = useMemo(() => {
    if (!currentData) return null;

    // Using the current timestamp to ensure we get a fresh object reference
    // This is a more React-friendly alternative to using chartKey as a dependency
    return {
      labels: currentData.time.map((t) => t.toFixed(1)),
      datasets: [
        {
          label: "Radial Velocity (m/s)",
          data: [...currentData.rv], // Create new array to force update
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.1)",
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.1,
        },
      ],
    };
  }, [currentData]); // chartKey removed from dependencies

  // Chart data for periodogram
  const periodogramChartData = useMemo(() => {
    if (!analysisResults || !analysisResults.periodogram) return null;

    // Using deep copy to ensure we get a fresh object reference
    return {
      labels: [...analysisResults.periodogram.periods].map((p) => p.toFixed(2)),
      datasets: [
        {
          label: "Power Spectral Density",
          data: [...analysisResults.periodogram.power], // Create new array to force update
          borderColor: "#ff6b6b",
          backgroundColor: "rgba(255, 107, 107, 0.1)",
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 3,
          tension: 0.1,
        },
      ],
    };
  }, [analysisResults]); // chartKey removed from dependencies

  // Chart options with proper cleanup configuration
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#ffffff",
          },
        },
        tooltip: {
          backgroundColor: "rgba(10, 13, 31, 0.9)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "#007bff",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#ffffff",
            maxTicksLimit: 20,
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          ticks: {
            color: "#ffffff",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    }),
    []
  );

  const periodogramOptions = {
    ...chartOptions,
    scales: {
      x: {
        ...chartOptions.scales.x,
        title: {
          display: true,
          text: "Period (days)",
          color: "#ffffff",
        },
      },
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: "Power",
          color: "#ffffff",
        },
        type: "logarithmic",
      },
    },
  };

  return (
    <div className="radialVelocityPage">
      <Header />
      <RVSideNav />
      <div className="rvContent">
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
        <div id="controls" className="rvCard fadeInUp">
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
                onChange={handleDatasetChange}
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
                onChange={handleNumPointsChange}
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
                onChange={handleStellarMassChange}
                step="0.1"
                min="0.1"
                max="5.0"
                className="controlInput"
                placeholder="1.0"
              />
            </div>

            <div className="controlGroup">
              <label className="controlLabel">Downsample Points:</label>
              <input
                type="number"
                value={downsamplePoints}
                onChange={(e) =>
                  setDownsamplePoints(parseInt(e.target.value, 10) || 500)
                }
                min="100"
                max="2000"
                className="controlInput"
                placeholder="500"
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
              className="rvButton rvButtonSecondary"
              onClick={analyzeData}
              disabled={loading || !currentData}
            >
              {loading ? "Analyzing..." : "Analyze Data"}
            </button>
          </div>

          {error && (
            <div className="errorMessage">
              <span className="emoji">⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Current Dataset Info */}
        {currentData && (
          <div id="dataset-stats" className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">📈</span>
              Current Dataset Statistics
            </h3>
            <div className="statsGrid">
              <div className="statItem">
                <span className="statLabel">Data Points:</span>
                <span className="statValue">{currentData.time.length}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">Mean RV:</span>
                <span className="statValue">{stats.mean?.toFixed(3)} m/s</span>
              </div>
              <div className="statItem">
                <span className="statLabel">RV Range:</span>
                <span className="statValue">{stats.range?.toFixed(3)} m/s</span>
              </div>
              <div className="statItem">
                <span className="statLabel">Std Deviation:</span>
                <span className="statValue">
                  {stats.stdDev?.toFixed(3)} m/s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Radial Velocity Time Series Graph */}
        {currentData && rvChartData && (
          <div id="rv-timeseries" className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">📊</span>
              Radial Velocity Time Series
            </h3>
            <div className="chartContainer">
              <SafeLineChart
                chartId={`rv-chart-${chartKey}`}
                data={{ ...rvChartData }} // Create a new object reference to force re-render
                options={chartOptions}
                height={300}
              />
            </div>
            <div className="chartDescription">
              <p>
                This graph shows the radial velocity measurements over time.
                Periodic variations indicate the presence of an orbiting planet
                causing the star to wobble due to gravitational interactions.
              </p>
            </div>
          </div>
        )}

        {/* Periodogram Analysis Graph */}
        {analysisResults &&
          analysisResults.periodogram &&
          periodogramChartData && (
            <div id="periodogram" className="rvCard fadeInUp">
              <h3 className="rvCardTitle">
                <span className="emoji">🔬</span>
                Lomb-Scargle Periodogram Analysis
              </h3>
              <div className="chartContainer">
                <SafeLineChart
                  chartId={`periodogram-chart-${chartKey}`}
                  data={{ ...periodogramChartData }} // Create a new object reference to force re-render
                  options={periodogramOptions}
                  height={300}
                />
              </div>
              <div className="chartDescription">
                <p>
                  The periodogram reveals periodic signals in the data. High
                  power peaks indicate potential orbital periods. The most
                  significant peak at{" "}
                  <strong>
                    {analysisResults.periodogram?.best_period?.toFixed(2)} days
                  </strong>{" "}
                  represents the detected planetary orbital period.
                </p>
                {analysisResults.periodogram?.false_alarm_probability && (
                  <div className="statisticalInfo">
                    <span className="statLabel">False Alarm Probability:</span>
                    <span className="statValue">
                      {(
                        analysisResults.periodogram.false_alarm_probability *
                        100
                      ).toFixed(4)}
                      %
                    </span>
                  </div>
                )}
                <div className="statisticalInfo">
                  <span className="statLabel">Peak Power:</span>
                  <span className="statValue">
                    {analysisResults.periodogram?.peak_power?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Analysis Results */}
        {analysisResults && (
          <div id="results" className="rvCard fadeInUp">
            <h3 className="rvCardTitle">
              <span className="emoji">🎯</span>
              Detection Results
            </h3>
            <div className="resultsSection">
              {analysisResults.detection_status === "planet_detected" ? (
                <div className="detectionSuccess">
                  <h4 className="resultTitle">🎉 Planet Detected!</h4>
                  <div className="detectionBadge">
                    Detection Significance:{" "}
                    <strong>{analysisResults.detection_significance}</strong>
                  </div>
                  <div className="resultGrid">
                    <div className="resultItem">
                      <span className="resultLabel">Period:</span>
                      <span className="resultValue">
                        {analysisResults.analysis_summary?.period_days?.toFixed(
                          2
                        ) ||
                          analysisResults.periodogram?.best_period?.toFixed(
                            2
                          )}{" "}
                        days
                      </span>
                    </div>
                    <div className="resultItem">
                      <span className="resultLabel">RV Amplitude:</span>
                      <span className="resultValue">
                        {analysisResults.analysis_summary?.rv_amplitude_ms?.toFixed(
                          3
                        )}{" "}
                        m/s
                      </span>
                    </div>
                    <div className="resultItem">
                      <span className="resultLabel">Minimum Mass:</span>
                      <span className="resultValue">
                        {analysisResults.analysis_summary?.min_planet_mass_earth?.toFixed(
                          3
                        )}{" "}
                        M⊕
                      </span>
                    </div>
                    <div className="resultItem">
                      <span className="resultLabel">Semi-major Axis:</span>
                      <span className="resultValue">
                        {analysisResults.analysis_summary?.semi_major_axis_au?.toFixed(
                          3
                        )}{" "}
                        AU
                      </span>
                    </div>
                    <div className="resultItem">
                      <span className="resultLabel">Fit Quality:</span>
                      <span className="resultValue">
                        {analysisResults.analysis_summary?.fit_quality ||
                          "unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="detectionFailure">
                  <h4 className="resultTitle">No Planet Detected</h4>
                  <p className="resultValue">
                    No significant periodic signal found in the radial velocity
                    data. This could indicate no planet, or the signal is below
                    detection threshold.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Section */}
        <div id="about-rv" className="rvCard fadeInUp">
          <h3 className="rvCardTitle">
            <span className="emoji">📚</span>
            About the Radial Velocity Method
          </h3>
          <div className="aboutSection">
            <p>
              The radial velocity method detects exoplanets by measuring the
              tiny wobbles in a star's motion caused by the gravitational pull
              of orbiting planets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadialVelocityAnalysisWorking;
