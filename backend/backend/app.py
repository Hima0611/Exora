from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import requests
from datetime import datetime
import json
import os
from io import StringIO
from services.data_processor import DataProcessor
from services.nasa_api import NASAExoplanetAPI
from services.prediction_service import ExoplanetPredictor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
data_processor = DataProcessor()
nasa_api = NASAExoplanetAPI()
try:
    predictor = ExoplanetPredictor()
    print("Exoplanet predictor loaded successfully!")
except Exception as e:
    predictor = None
    print(f"Warning: Could not load predictor - {e}")

@app.route('/')
def index():
    """Main dashboard with overview"""
    return render_template('index.html')

@app.route('/starmap')
def starmap():
    """Interactive star map page"""
    return render_template('starmap.html')

@app.route('/discovery-trends')
def discovery_trends():
    """Exoplanet discovery trends and statistics"""
    return render_template('discovery_trends.html')

@app.route('/orbital-viewer')
def orbital_viewer():
    """3D orbital visualization page"""
    return render_template('orbital_viewer.html')

@app.route('/planet-explorer')
def planet_explorer():
    """Individual planet exploration page"""
    return render_template('planet_explorer.html')

# API Endpoints
@app.route('/api/exoplanets')
def get_exoplanets():
    """Get exoplanet data from NASA API"""
    try:
        limit = request.args.get('limit', 100)
        exoplanets = nasa_api.get_exoplanets(limit=int(limit))
        return jsonify(exoplanets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/star/<star_name>')
def get_star_info(star_name):
    """Get information about a specific star and its planets"""
    try:
        star_data = nasa_api.get_star_info(star_name)
        return jsonify(star_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/discovery-stats')
def get_discovery_stats():
    """Get discovery statistics for charts"""
    try:
        stats = data_processor.get_discovery_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/discovery-methods')
def get_discovery_methods():
    """Get discovery methods distribution"""
    try:
        methods = data_processor.get_discovery_methods()
        return jsonify(methods)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/planet-sizes')
def get_planet_sizes():
    """Get planet size comparisons"""
    try:
        sizes = data_processor.get_planet_size_distribution()
        return jsonify(sizes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orbital-data/<planet_name>')
def get_orbital_data(planet_name):
    """Get orbital data for 3D visualization"""
    try:
        orbital_data = data_processor.get_orbital_parameters(planet_name)
        return jsonify(orbital_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/nearby-stars')
def get_nearby_stars():
    """Get nearby stars for star map"""
    try:
        distance_limit = request.args.get('distance', 50)  # parsecs
        stars = nasa_api.get_nearby_stars(float(distance_limit))
        return jsonify(stars)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Prediction Endpoints
@app.route('/api/predict/single', methods=['POST'])
def predict_single():
    """Predict exoplanet classification for single input"""
    if not predictor:
        return jsonify({'error': 'Prediction model not available'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result = predictor.predict_single(data)
        return jsonify(result)
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """Predict exoplanet classification for CSV data"""
    if not predictor:
        return jsonify({'error': 'Prediction model not available'}), 500
    
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read CSV data
        if file.filename.endswith('.csv'):
            csv_data = file.read().decode('utf-8')
            df = pd.read_csv(StringIO(csv_data))
        else:
            return jsonify({'error': 'Only CSV files are supported'}), 400
        
        if df.empty:
            return jsonify({'error': 'CSV file is empty'}), 400
        
        # Make predictions
        results = predictor.predict_batch(df)
        return jsonify(results)
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500

@app.route('/api/predict/features', methods=['GET'])
def get_prediction_features():
    """Get information about required features for prediction"""
    if not predictor:
        return jsonify({'error': 'Prediction model not available'}), 500
    
    try:
        feature_info = predictor.get_feature_info()
        return jsonify(feature_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict')
def prediction_page():
    """Exoplanet prediction page"""
    return render_template('prediction.html')

@app.route('/api/sample-data')
def download_sample_data():
    """Download sample CSV template"""
    try:
        from flask import send_file
        import os
        sample_file = os.path.join(app.static_folder, 'sample_data.csv')
        return send_file(sample_file, as_attachment=True, download_name='sample_exoplanet_data.csv')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Initialize data on startup
    print("Initializing exoplanet data...")
    try:
        nasa_api.initialize_data()
        print("Data initialization complete!")
    except Exception as e:
        print(f"Warning: Could not initialize all data - {e}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)