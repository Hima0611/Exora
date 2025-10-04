import requests
import json

# Test the prediction API
base_url = "http://localhost:5000"

def test_feature_info():
    """Test getting feature information"""
    print("Testing feature info endpoint...")
    response = requests.get(f"{base_url}/api/predict/features")
    if response.status_code == 200:
        data = response.json()
        print("✓ Feature info retrieved successfully")
        print(f"Features: {data['features']}")
        print(f"Labels: {data['labels']}")
    else:
        print(f"✗ Error: {response.status_code} - {response.text}")
    print()

def test_single_prediction():
    """Test single prediction"""
    print("Testing single prediction...")
    
    # Sample exoplanet candidate data
    test_data = {
        "koi_period": 10.845,
        "koi_duration": 3.5,
        "koi_prad": 1.2,
        "koi_model_snr": 15.3,
        "koi_teq": 300,
        "koi_steff": 5500,
        "koi_slogg": 4.5,
        "koi_srad": 1.1
    }
    
    response = requests.post(
        f"{base_url}/api/predict/single",
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Single prediction successful")
        print(f"Prediction: {result['prediction']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Probabilities: {result['probabilities']}")
    else:
        print(f"✗ Error: {response.status_code} - {response.text}")
    print()

def test_batch_prediction():
    """Test batch prediction with CSV data"""
    print("Testing batch prediction...")
    
    # Create a simple CSV content
    csv_content = """koi_period,koi_duration,koi_prad,koi_model_snr,koi_teq,koi_steff,koi_slogg,koi_srad
10.845,3.5,1.2,15.3,300,5500,4.5,1.1
5.4,2.1,0.8,8.7,450,5200,4.2,0.95
100.2,8.4,2.3,25.6,180,6100,4.1,1.35"""
    
    files = {'file': ('test_data.csv', csv_content, 'text/csv')}
    
    response = requests.post(f"{base_url}/api/predict/batch", files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Batch prediction successful")
        print(f"Total predictions: {result['summary']['total_predictions']}")
        print(f"Confirmed: {result['summary']['confirmed']}")
        print(f"Candidates: {result['summary']['candidates']}")
        print(f"False positives: {result['summary']['false_positives']}")
        print(f"Average confidence: {result['summary']['average_confidence']:.3f}")
    else:
        print(f"✗ Error: {response.status_code} - {response.text}")
    print()

if __name__ == "__main__":
    print("🚀 Testing Exoplanet Prediction API")
    print("=" * 50)
    
    try:
        # Test all endpoints
        test_feature_info()
        test_single_prediction()
        test_batch_prediction()
        
        print("✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure Flask is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")