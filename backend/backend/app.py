from flask import Flask, render_template, jsonify, request 
from flask import redirect
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
from services.radial_velocity import RadialVelocityAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
data_processor = DataProcessor()
nasa_api = NASAExoplanetAPI()
rv_analyzer = RadialVelocityAnalyzer()

try:
    predictor = ExoplanetPredictor()
    print("Exoplanet predictor loaded successfully!")
except Exception as e:
    predictor = None
    print(f"Warning: Could not load predictor - {e}")

def convert_for_json(obj):
    """Convert numpy and boolean types for JSON serialization"""
    if isinstance(obj, dict):
        return {key: convert_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_for_json(item) for item in obj]
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, str):
        return str(obj)
    elif obj is None:
        return None
    elif isinstance(obj, (int, float)):
        return obj
    else:
        try:
            return str(obj)
        except:
            return None


@app.route('/')
def index():
    """Main dashboard with overview"""
    return redirect("https://exora-lovat.vercel.app/")

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

# Radial Velocity API Endpoints
@app.route('/api/rv/generate-dataset')
def generate_rv_dataset():
    """Generate synthetic radial velocity dataset"""
    try:
        dataset_type = request.args.get('type', 'jupiter')  # jupiter, earth, noise
        num_points = int(request.args.get('points', 150))
        
        if dataset_type == 'noise':
            has_planet = False
        else:
            has_planet = True
            
        data = rv_analyzer.generate_synthetic_rv_data(num_points, has_planet)
        
        # Adjust for different planet types
        if dataset_type == 'earth':
            # Reduce amplitude for Earth-like planet but keep it detectable
            earth_factor = 0.3  # Still detectable but weaker than Jupiter
            for i in range(len(data['true_signal'])):
                data['true_signal'][i] *= earth_factor
                # Reconstruct RV with reduced signal but same noise
                noise = data['rv'][i] - (data['true_signal'][i] / earth_factor)
                data['rv'][i] = data['true_signal'][i] + noise
            data['parameters']['K_amplitude'] *= earth_factor
            data['parameters']['planet_mass_earth'] *= earth_factor
        
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rv/analyze', methods=['POST'])
def analyze_rv_data():
    """Analyze radial velocity data for exoplanet detection"""
    try:
        data = request.get_json()
        
        # Parse and validate input data
        time = np.array(data['time'], dtype=float)
        rv = np.array(data['rv'], dtype=float)
        rv_error = np.array(data['rv_error'], dtype=float)
        stellar_mass = float(data.get('stellar_mass', 1.0))
        
        # Perform full analysis
        results = rv_analyzer.full_rv_analysis(time, rv, rv_error, stellar_mass)
        
        # Convert results to JSON-serializable format
        json_safe_results = convert_for_json(results)
        
        # Try to cache results (but don't fail if caching doesn't work)
        try:
            rv_analyzer.save_analysis_cache(results)
        except Exception:
            # Continue anyway - caching is optional
            pass
        
        return jsonify(json_safe_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rv/test-datasets')
def get_rv_test_datasets():
    """Get predefined test datasets for radial velocity analysis"""
    try:
        datasets = rv_analyzer.generate_test_datasets()
        json_safe_datasets = convert_for_json(datasets)
        return jsonify(json_safe_datasets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rv/periodogram', methods=['POST'])
def calculate_periodogram():
    """Calculate Lomb-Scargle periodogram for given data"""
    try:
        data = request.get_json()
        
        time = np.array(data['time'])
        rv = np.array(data['rv'])
        rv_error = np.array(data['rv_error'])
        
        periodogram = rv_analyzer.detect_periodicity(time, rv, rv_error)
        json_safe_periodogram = convert_for_json(periodogram)
        return jsonify(json_safe_periodogram)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/rv/fit-orbit', methods=['POST'])
def fit_keplerian_orbit():
    """Fit Keplerian orbital model to radial velocity data"""
    try:
        data = request.get_json()
        
        time = np.array(data['time'])
        rv = np.array(data['rv'])
        rv_error = np.array(data['rv_error'])
        period = data['period']
        
        orbital_fit = rv_analyzer.fit_keplerian_orbit(time, rv, rv_error, period)
        json_safe_orbital_fit = convert_for_json(orbital_fit)
        return jsonify(json_safe_orbital_fit)
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