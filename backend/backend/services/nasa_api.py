import requests
import pandas as pd
import numpy as np
from datetime import datetime
import json
import os

class NASAExoplanetAPI:
    """Service for fetching and processing NASA exoplanet data"""
    
    def __init__(self):
        self.base_url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
        self.cache_file = "data/exoplanets_cache.json"
        self.stars_cache_file = "data/stars_cache.json"
        self.exoplanets_data = []
        self.stars_data = []
    
    def initialize_data(self):
        """Initialize exoplanet and star data"""
        self.load_exoplanets()
        self.load_stars()
    
    def load_exoplanets(self):
        """Load exoplanet data from NASA API or cache"""
        if os.path.exists(self.cache_file):
            print("Loading exoplanet data from cache...")
            with open(self.cache_file, 'r') as f:
                self.exoplanets_data = json.load(f)
        else:
            print("Fetching exoplanet data from NASA API...")
            self.fetch_exoplanet_data()
    
    def load_stars(self):
        """Load star data from cache or generate sample data"""
        if os.path.exists(self.stars_cache_file):
            with open(self.stars_cache_file, 'r') as f:
                self.stars_data = json.load(f)
        else:
            print("Generating sample star data...")
            self.generate_sample_stars()
    
    def fetch_exoplanet_data(self):
        """Fetch exoplanet data from NASA Exoplanet Archive"""
        try:
            # Query for confirmed exoplanets
            query = """
            SELECT pl_name, hostname, pl_orbper, pl_rade, pl_masse, 
                   pl_eqt, disc_year, discoverymethod, ra, dec, sy_dist
            FROM ps 
            WHERE default_flag = 1 
            ORDER BY disc_year DESC
            """
            
            params = {
                'query': query,
                'format': 'json'
            }
            
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Process and clean the data
            processed_data = []
            for planet in data:
                if planet.get('pl_name') and planet.get('hostname'):
                    processed_planet = {
                        'name': planet['pl_name'],
                        'host_star': planet['hostname'],
                        'orbital_period': planet.get('pl_orbper'),
                        'radius': planet.get('pl_rade'),
                        'mass': planet.get('pl_masse'),
                        'equilibrium_temp': planet.get('pl_eqt'),
                        'discovery_year': planet.get('disc_year'),
                        'discovery_method': planet.get('discoverymethod', 'Unknown'),
                        'ra': planet.get('ra'),
                        'dec': planet.get('dec'),
                        'distance': planet.get('sy_dist')
                    }
                    processed_data.append(processed_planet)
            
            self.exoplanets_data = processed_data
            
            # Cache the data
            with open(self.cache_file, 'w') as f:
                json.dump(self.exoplanets_data, f, indent=2)
            
            print(f"Fetched {len(self.exoplanets_data)} exoplanets")
            
        except Exception as e:
            print(f"Error fetching NASA data: {e}")
            # Fallback to sample data
            self.generate_sample_exoplanets()
    
    def generate_sample_exoplanets(self):
        """Generate sample exoplanet data for demonstration"""
        print("Generating sample exoplanet data...")
        
        sample_planets = []
        discovery_methods = ['Transit', 'Radial Velocity', 'Direct Imaging', 'Microlensing', 'Astrometry']
        
        for i in range(200):
            planet = {
                'name': f'Kepler-{i+1}b',
                'host_star': f'Kepler-{i+1}',
                'orbital_period': np.random.uniform(1, 1000),
                'radius': np.random.uniform(0.5, 15),
                'mass': np.random.uniform(0.1, 300),
                'equilibrium_temp': np.random.uniform(200, 2000),
                'discovery_year': np.random.randint(1995, 2024),
                'discovery_method': np.random.choice(discovery_methods),
                'ra': np.random.uniform(0, 360),
                'dec': np.random.uniform(-90, 90),
                'distance': np.random.uniform(10, 1000)
            }
            sample_planets.append(planet)
        
        self.exoplanets_data = sample_planets
        
        # Cache the sample data
        with open(self.cache_file, 'w') as f:
            json.dump(self.exoplanets_data, f, indent=2)
    
    def generate_sample_stars(self):
        """Generate sample star data for the star map"""
        print("Generating sample star data...")
        
        sample_stars = []
        star_types = ['G', 'K', 'M', 'F', 'A']
        
        for i in range(500):
            has_planets = np.random.random() < 0.3  # 30% chance of having planets
            
            star = {
                'name': f'HD {i+1000}',
                'ra': np.random.uniform(0, 360),
                'dec': np.random.uniform(-90, 90),
                'distance': np.random.uniform(1, 100),
                'magnitude': np.random.uniform(-1, 12),
                'spectral_type': np.random.choice(star_types),
                'temperature': np.random.uniform(3000, 8000),
                'has_planets': has_planets,
                'planet_count': np.random.randint(1, 8) if has_planets else 0
            }
            sample_stars.append(star)
        
        self.stars_data = sample_stars
        
        # Cache the sample data
        with open(self.stars_cache_file, 'w') as f:
            json.dump(self.stars_data, f, indent=2)
    
    def get_exoplanets(self, limit=100):
        """Get exoplanet data with optional limit"""
        return self.exoplanets_data[:limit]
    
    def get_star_info(self, star_name):
        """Get information about a specific star"""
        # Find star in our data
        star = next((s for s in self.stars_data if s['name'].lower() == star_name.lower()), None)
        
        if not star:
            return {'error': 'Star not found'}
        
        # Find planets for this star
        planets = [p for p in self.exoplanets_data if p['host_star'].lower() == star_name.lower()]
        
        return {
            'star': star,
            'planets': planets
        }
    
    def get_nearby_stars(self, distance_limit):
        """Get stars within a certain distance"""
        nearby = [s for s in self.stars_data if s['distance'] <= distance_limit]
        return sorted(nearby, key=lambda x: x['distance'])