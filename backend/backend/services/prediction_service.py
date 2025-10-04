import joblib
import json
import pandas as pd
import numpy as np
from pathlib import Path
import os

class ExoplanetPredictor:
    def __init__(self, model_path=None):
        """Initialize the exoplanet predictor with model and metadata"""
        if model_path is None:
            model_path = Path(__file__).parent.parent
        else:
            model_path = Path(model_path)
            
        self.model_path = model_path
        self.model = None
        self.features = None
        self.label_map = None
        self.inv_label_map = None
        
        self.load_model_and_metadata()
    
    def load_model_and_metadata(self):
        """Load the trained model and associated metadata"""
        try:
            # Load the model
            model_file = self.model_path / "model.pkl"
            if not model_file.exists():
                raise FileNotFoundError(f"Model file not found at {model_file}")
            
            self.model = joblib.load(model_file)
            
            # Load feature list
            feature_file = self.model_path / "feature_list.json"
            if feature_file.exists():
                with open(feature_file, 'r') as f:
                    self.features = json.load(f)
            else:
                # Default features based on your training script
                self.features = [
                    "koi_period",
                    "koi_duration", 
                    "koi_prad",
                    "koi_model_snr",
                    "koi_teq",
                    "koi_steff",
                    "koi_slogg",
                    "koi_srad"
                ]
            
            # Load label map
            label_file = self.model_path / "label_map.json"
            if label_file.exists():
                with open(label_file, 'r') as f:
                    self.label_map = json.load(f)
            else:
                # Default label map based on your training script
                self.label_map = {"FALSE POSITIVE": 0, "CONFIRMED": 1, "CANDIDATE": 2}
            
            self.inv_label_map = {v: k for k, v in self.label_map.items()}
            
            print("Model and metadata loaded successfully!")
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def validate_input(self, data):
        """Validate input data has all required features"""
        if isinstance(data, dict):
            missing_features = [f for f in self.features if f not in data]
            if missing_features:
                raise ValueError(f"Missing required features: {missing_features}")
            
            # Check for valid numeric values
            for feature in self.features:
                try:
                    float(data[feature])
                except (ValueError, TypeError):
                    raise ValueError(f"Feature '{feature}' must be a valid number")
                    
        elif isinstance(data, pd.DataFrame):
            missing_features = [f for f in self.features if f not in data.columns]
            if missing_features:
                raise ValueError(f"Missing required columns: {missing_features}")
            
            # Check for null values
            null_counts = data[self.features].isnull().sum()
            if null_counts.any():
                null_features = null_counts[null_counts > 0].index.tolist()
                raise ValueError(f"Null values found in columns: {null_features}")
    
    def predict_single(self, input_data):
        """Predict for a single planet candidate"""
        try:
            self.validate_input(input_data)
            
            # Convert to numpy array
            X = np.array([[float(input_data[f]) for f in self.features]])
            
            # Get prediction and probabilities
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            
            # Format result
            result = {
                'prediction': self.inv_label_map[prediction],
                'prediction_code': int(prediction),
                'probabilities': {
                    self.inv_label_map[i]: float(prob) 
                    for i, prob in enumerate(probabilities)
                },
                'confidence': float(max(probabilities)),
                'features_used': dict(zip(self.features, [float(input_data[f]) for f in self.features]))
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Prediction error: {str(e)}")
    
    def predict_batch(self, df):
        """Predict for multiple planet candidates from DataFrame"""
        try:
            self.validate_input(df)
            
            # Prepare data
            X = df[self.features].values
            
            # Get predictions and probabilities
            predictions = self.model.predict(X)
            probabilities = self.model.predict_proba(X)
            
            # Format results
            results = []
            for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
                result = {
                    'index': i,
                    'prediction': self.inv_label_map[pred],
                    'prediction_code': int(pred),
                    'probabilities': {
                        self.inv_label_map[j]: float(prob) 
                        for j, prob in enumerate(probs)
                    },
                    'confidence': float(max(probs)),
                    'features': dict(zip(self.features, [float(x) for x in X[i]]))
                }
                results.append(result)
            
            # Summary statistics
            summary = {
                'total_predictions': len(results),
                'confirmed': sum(1 for r in results if r['prediction'] == 'CONFIRMED'),
                'candidates': sum(1 for r in results if r['prediction'] == 'CANDIDATE'),
                'false_positives': sum(1 for r in results if r['prediction'] == 'FALSE POSITIVE'),
                'average_confidence': float(np.mean([r['confidence'] for r in results]))
            }
            
            return {
                'predictions': results,
                'summary': summary
            }
            
        except Exception as e:
            raise Exception(f"Batch prediction error: {str(e)}")
    
    def get_feature_info(self):
        """Get information about required features"""
        feature_descriptions = {
            "koi_period": "Orbital period of the planet candidate (days)",
            "koi_duration": "Duration of the transit event (hours)",
            "koi_prad": "Planet radius in Earth radii",
            "koi_model_snr": "Signal-to-noise ratio of the transit model",
            "koi_teq": "Equilibrium temperature of the planet (K)",
            "koi_steff": "Stellar effective temperature (K)",
            "koi_slogg": "Stellar surface gravity (log g)",
            "koi_srad": "Stellar radius in solar radii"
        }
        
        return {
            'features': self.features,
            'descriptions': feature_descriptions,
            'labels': list(self.label_map.keys())
        }