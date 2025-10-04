import pandas as pd
import numpy as np
from datetime import datetime
import json
from collections import Counter

class DataProcessor:
    """Service for processing and analyzing exoplanet data"""
    
    def __init__(self):
        self.cache_stats_file = "data/stats_cache.json"
    
    def get_discovery_statistics(self):
        """Get discovery statistics by year"""
        from services.nasa_api import NASAExoplanetAPI
        nasa_api = NASAExoplanetAPI()
        
        # Load data if not already loaded
        if not nasa_api.exoplanets_data:
            nasa_api.load_exoplanets()
        
        # Count discoveries by year
        years = []
        for planet in nasa_api.exoplanets_data:
            if planet.get('discovery_year'):
                years.append(int(planet['discovery_year']))
        
        year_counts = Counter(years)
        
        # Convert to format suitable for charts
        stats = {
            'years': sorted(year_counts.keys()),
            'counts': [year_counts[year] for year in sorted(year_counts.keys())],
            'total_planets': len(nasa_api.exoplanets_data),
            'total_years': len(year_counts),
            'peak_year': max(year_counts, key=year_counts.get),
            'peak_count': max(year_counts.values())
        }
        
        return stats
    
    def get_discovery_methods(self):
        """Get discovery methods distribution"""
        from services.nasa_api import NASAExoplanetAPI
        nasa_api = NASAExoplanetAPI()
        
        if not nasa_api.exoplanets_data:
            nasa_api.load_exoplanets()
        
        methods = []
        for planet in nasa_api.exoplanets_data:
            method = planet.get('discovery_method', 'Unknown')
            methods.append(method)
        
        method_counts = Counter(methods)
        
        # Convert to format suitable for pie charts
        return {
            'methods': list(method_counts.keys()),
            'counts': list(method_counts.values()),
            'percentages': [count/sum(method_counts.values())*100 for count in method_counts.values()]
        }
    
    def get_planet_size_distribution(self):
        """Get planet size distribution and comparisons"""
        from services.nasa_api import NASAExoplanetAPI
        nasa_api = NASAExoplanetAPI()
        
        if not nasa_api.exoplanets_data:
            nasa_api.load_exoplanets()
        
        # Collect radius data
        radii = []
        for planet in nasa_api.exoplanets_data:
            if planet.get('radius') and planet['radius'] > 0:
                radii.append(float(planet['radius']))
        
        # Create size categories (in Earth radii)
        size_categories = {
            'Super-Earth (1-1.75 R⊕)': 0,
            'Sub-Neptune (1.75-3.5 R⊕)': 0,
            'Neptune-size (3.5-8 R⊕)': 0,
            'Jupiter-size (8+ R⊕)': 0
        }
        
        for radius in radii:
            if 1 <= radius < 1.75:
                size_categories['Super-Earth (1-1.75 R⊕)'] += 1
            elif 1.75 <= radius < 3.5:
                size_categories['Sub-Neptune (1.75-3.5 R⊕)'] += 1
            elif 3.5 <= radius < 8:
                size_categories['Neptune-size (3.5-8 R⊕)'] += 1
            elif radius >= 8:
                size_categories['Jupiter-size (8+ R⊕)'] += 1
        
        return {
            'categories': list(size_categories.keys()),
            'counts': list(size_categories.values()),
            'raw_radii': radii,
            'earth_radius': 1.0,
            'jupiter_radius': 11.2,
            'statistics': {
                'min': min(radii) if radii else 0,
                'max': max(radii) if radii else 0,
                'mean': np.mean(radii) if radii else 0,
                'median': np.median(radii) if radii else 0
            }
        }
    
    def get_orbital_parameters(self, planet_name):
        """Get orbital parameters for 3D visualization"""
        from services.nasa_api import NASAExoplanetAPI
        nasa_api = NASAExoplanetAPI()
        
        if not nasa_api.exoplanets_data:
            nasa_api.load_exoplanets()
        
        # Find the specific planet
        planet = next((p for p in nasa_api.exoplanets_data if p['name'].lower() == planet_name.lower()), None)
        
        if not planet:
            # Return default orbital parameters for demonstration
            planet = {
                'name': planet_name,
                'orbital_period': 365.25,
                'radius': 1.0,
                'distance': 50
            }
        
        # Calculate orbital parameters for visualization
        orbital_period = planet.get('orbital_period', 365.25)  # days
        planet_radius = planet.get('radius', 1.0)  # Earth radii
        
        # Generate orbital positions (simplified circular orbit)
        num_points = 100
        angles = np.linspace(0, 2*np.pi, num_points)
        
        # Semi-major axis (AU) - rough calculation from orbital period using Kepler's 3rd law
        # Assumes solar mass star: a³ ∝ T²
        semi_major_axis = (orbital_period / 365.25) ** (2/3)
        
        positions = []
        for angle in angles:
            x = semi_major_axis * np.cos(angle)
            y = semi_major_axis * np.sin(angle)
            z = 0  # Assume coplanar orbit for simplicity
            positions.append({'x': x, 'y': y, 'z': z})
        
        return {
            'planet_name': planet['name'],
            'host_star': planet.get('host_star', 'Unknown Star'),
            'orbital_period': orbital_period,
            'semi_major_axis': semi_major_axis,
            'planet_radius': planet_radius,
            'orbital_positions': positions,
            'planet_properties': {
                'mass': planet.get('mass'),
                'equilibrium_temp': planet.get('equilibrium_temp'),
                'discovery_year': planet.get('discovery_year'),
                'discovery_method': planet.get('discovery_method')
            }
        }
    
    def get_habitable_zone_planets(self):
        """Get planets potentially in the habitable zone"""
        from services.nasa_api import NASAExoplanetAPI
        nasa_api = NASAExoplanetAPI()
        
        if not nasa_api.exoplanets_data:
            nasa_api.load_exoplanets()
        
        habitable_planets = []
        
        for planet in nasa_api.exoplanets_data:
            temp = planet.get('equilibrium_temp')
            radius = planet.get('radius')
            
            # Rough habitable zone criteria
            if temp and radius:
                if 200 <= temp <= 350 and 0.5 <= radius <= 2.5:
                    habitable_planets.append(planet)
        
        return habitable_planets