// Main JavaScript utilities for A World Away

// Global utilities
const Utils = {
  // Format numbers with appropriate units
  formatNumber(num) {
    if (num === null || num === undefined) return "Unknown";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  },

  // Format temperature with Kelvin/Celsius conversion
  formatTemperature(kelvin) {
    if (!kelvin) return "Unknown";
    const celsius = kelvin - 273.15;
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${kelvin.toFixed(0)} K (${celsius.toFixed(
      0
    )}°C, ${fahrenheit.toFixed(0)}°F)`;
  },

  // Format distance in parsecs/light years
  formatDistance(parsecs) {
    if (!parsecs) return "Unknown";
    const lightYears = parsecs * 3.26156;
    return `${parsecs.toFixed(1)} pc (${lightYears.toFixed(1)} ly)`;
  },

  // Format orbital period in days/years
  formatPeriod(days) {
    if (!days) return "Unknown";
    if (days < 365) {
      return `${days.toFixed(1)} days`;
    } else {
      const years = days / 365.25;
      return `${years.toFixed(2)} years (${days.toFixed(0)} days)`;
    }
  },

  // Debounce function for search inputs
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show loading spinner
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div class="loading-spinner">🌌 Loading...</div>';
    }
  },

  // Show error message
  showError(containerId, message = "An error occurred while loading data") {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    }
  },

  // API call wrapper with error handling
  async apiCall(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  },
};

// Navigation utilities
const Navigation = {
  // Update active navigation link
  setActiveLink(currentPath) {
    const links = document.querySelectorAll(".nav-link");
    links.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  },

  // Initialize navigation
  init() {
    const currentPath = window.location.pathname;
    this.setActiveLink(currentPath);
  },
};

// Chart utilities using Plotly
const ChartUtils = {
  // Default layout for all charts
  getDefaultLayout(title = "") {
    return {
      title: {
        text: title,
        font: { size: 18, color: "#ffffff" },
      },
      plot_bgcolor: "rgba(0,0,0,0)",
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        color: "#ffffff",
      },
      margin: { t: 50, r: 30, b: 60, l: 60 },
      xaxis: {
        gridcolor: "rgba(128, 128, 128, 0.2)",
        color: "#94a3b8",
      },
      yaxis: {
        gridcolor: "rgba(128, 128, 128, 0.2)",
        color: "#94a3b8",
      },
    };
  },

  // Create a responsive line chart
  createLineChart(containerId, data, title = "") {
    const trace = {
      x: data.x,
      y: data.y,
      type: "scatter",
      mode: "lines+markers",
      name: data.name || "Data",
      line: {
        color: data.color || "#4f46e5",
        width: 3,
      },
      marker: {
        size: 6,
        color: data.color || "#4f46e5",
      },
    };

    const layout = this.getDefaultLayout(title);
    layout.xaxis.title = data.xTitle || "X Axis";
    layout.yaxis.title = data.yTitle || "Y Axis";

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
  },

  // Create a pie chart
  createPieChart(containerId, data, title = "") {
    const trace = {
      labels: data.labels,
      values: data.values,
      type: "pie",
      hole: 0.3,
      marker: {
        colors: data.colors || [
          "#4f46e5",
          "#06b6d4",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
        line: { color: "white", width: 2 },
      },
    };

    const layout = this.getDefaultLayout(title);
    layout.showlegend = true;
    layout.legend = {
      orientation: "h",
      y: -0.1,
    };

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
  },

  // Create a bar chart
  createBarChart(containerId, data, title = "") {
    const trace = {
      x: data.x,
      y: data.y,
      type: "bar",
      marker: {
        color: data.colors || "#4f46e5",
        line: { color: "white", width: 1 },
      },
    };

    const layout = this.getDefaultLayout(title);
    layout.xaxis.title = data.xTitle || "Category";
    layout.yaxis.title = data.yTitle || "Count";

    Plotly.newPlot(containerId, [trace], layout, { responsive: true });
  },
};

// Data processing utilities
const DataProcessor = {
  // Filter exoplanet data by various criteria
  filterPlanets(planets, filters = {}) {
    return planets.filter((planet) => {
      // Text search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !planet.name.toLowerCase().includes(searchLower) &&
          !planet.host_star.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Discovery method filter
      if (filters.method && planet.discovery_method !== filters.method) {
        return false;
      }

      // Year range filter
      if (filters.yearMin && planet.discovery_year < filters.yearMin) {
        return false;
      }
      if (filters.yearMax && planet.discovery_year > filters.yearMax) {
        return false;
      }

      // Size range filter (in Earth radii)
      if (filters.sizeMin && planet.radius < filters.sizeMin) {
        return false;
      }
      if (filters.sizeMax && planet.radius > filters.sizeMax) {
        return false;
      }

      // Distance range filter (in parsecs)
      if (filters.distanceMax && planet.distance > filters.distanceMax) {
        return false;
      }

      return true;
    });
  },

  // Calculate habitability score for a planet
  calculateHabitabilityScore(planet) {
    let score = 0;
    const maxScore = 1.0;

    // Temperature scoring (0.4 max)
    if (planet.equilibrium_temp) {
      const temp = planet.equilibrium_temp;
      if (temp >= 273 && temp <= 373) {
        score += 0.4; // Liquid water range
      } else if (temp >= 200 && temp <= 500) {
        score += 0.2; // Extended habitable range
      }
    }

    // Size scoring (0.3 max)
    if (planet.radius) {
      const radius = planet.radius;
      if (radius >= 0.5 && radius <= 2.0) {
        score += 0.3; // Earth-like size range
      } else if (radius >= 0.3 && radius <= 3.0) {
        score += 0.15; // Extended size range
      }
    }

    // Orbital characteristics (0.2 max)
    if (planet.orbital_period) {
      const period = planet.orbital_period;
      // Rough approximation of habitable zone orbital periods
      if (period >= 200 && period <= 500) {
        score += 0.2;
      } else if (period >= 100 && period <= 1000) {
        score += 0.1;
      }
    }

    // Discovery method bonus (0.1 max)
    if (planet.discovery_method === "Transit") {
      score += 0.1; // Transit method can find smaller planets
    }

    return Math.min(maxScore, score);
  },

  // Group planets by discovery year
  groupByDiscoveryYear(planets) {
    const grouped = {};
    planets.forEach((planet) => {
      const year = planet.discovery_year;
      if (year) {
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(planet);
      }
    });
    return grouped;
  },

  // Get summary statistics for a dataset
  getStatistics(values) {
    if (!values || values.length === 0) {
      return { min: 0, max: 0, mean: 0, median: 0, count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const median =
      count % 2 === 0
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)];

    return {
      min: sorted[0],
      max: sorted[count - 1],
      mean: mean,
      median: median,
      count: count,
    };
  },
};

// Initialize navigation when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  Navigation.init();
});

// Global error handler for unhandled promises
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);
});

// Export utilities for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Utils, Navigation, ChartUtils, DataProcessor };
}
