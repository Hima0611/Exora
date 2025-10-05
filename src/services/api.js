import axios from "axios";

// Base URL for your Flask backend
const BASE_URL = "https://exora-yrj4.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// API service functions
export const apiService = {
  // Get exoplanet data
  getExoplanets: async (limit = 100) => {
    try {
      const response = await api.get(`/exoplanets?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exoplanets:", error);
      throw error;
    }
  },

  // Get discovery statistics
  getDiscoveryStats: async () => {
    try {
      const response = await api.get("/discovery-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching discovery stats:", error);
      throw error;
    }
  },

  // Get discovery methods distribution
  getDiscoveryMethods: async () => {
    try {
      const response = await api.get("/discovery-methods");
      return response.data;
    } catch (error) {
      console.error("Error fetching discovery methods:", error);
      throw error;
    }
  },

  // Get nearby stars for star map
  getNearbyStars: async (distance = 50) => {
    try {
      const response = await api.get(`/nearby-stars?distance=${distance}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby stars:", error);
      throw error;
    }
  },

  // Get specific star information
  getStarInfo: async (starName) => {
    try {
      const response = await api.get(`/star/${starName}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching star info:", error);
      throw error;
    }
  },

  // Get planet size distribution
  getPlanetSizes: async () => {
    try {
      const response = await api.get("/planet-sizes");
      return response.data;
    } catch (error) {
      console.error("Error fetching planet sizes:", error);
      throw error;
    }
  },

  // Get orbital data for a specific planet
  getOrbitalData: async (planetName) => {
    try {
      const response = await api.get(`/orbital-data/${planetName}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orbital data:", error);
      throw error;
    }
  },

  // Radial Velocity Analysis APIs
  generateRVDataset: async (type = "jupiter", points = 150) => {
    try {
      const response = await api.get(
        `/rv/generate-dataset?type=${type}&points=${points}`
      );
      return response.data;
    } catch (error) {
      console.error("Error generating RV dataset:", error);
      throw error;
    }
  },

  analyzeRVData: async (data) => {
    try {
      const response = await api.post("/rv/analyze", data);
      return response.data;
    } catch (error) {
      console.error("Error analyzing RV data:", error);
      throw error;
    }
  },

  getRVTestDatasets: async () => {
    try {
      const response = await api.get("/rv/test-datasets");
      return response.data;
    } catch (error) {
      console.error("Error fetching RV test datasets:", error);
      throw error;
    }
  },

  calculatePeriodogram: async (data) => {
    try {
      const response = await api.post("/rv/periodogram", data);
      return response.data;
    } catch (error) {
      console.error("Error calculating periodogram:", error);
      throw error;
    }
  },

  fitKeplerianOrbit: async (data) => {
    try {
      const response = await api.post("/rv/fit-orbit", data);
      return response.data;
    } catch (error) {
      console.error("Error fitting Keplerian orbit:", error);
      throw error;
    }
  },
};

export default apiService;
