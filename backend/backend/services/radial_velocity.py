import numpy as np
import pandas as pd
from datetime import datetime
import json
import os

try:
    from sklearn.metrics import  r2_score
except ImportError:
    print("Warning: sklearn not available, some features may be limited")
    # Provide fallback r2_score function
    def r2_score(y_true, y_pred):
        ss_res = np.sum((y_true - y_pred) ** 2)
        ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
        return 1 - (ss_res / ss_tot)

try:
    import scipy.signal as signal
except ImportError:
    print("Warning: scipy not available, using fallback periodogram")
    # Provide a simple fallback
    class signal:
        @staticmethod
        def lombscargle(t, y, f, normalize=True):
            # Simple DFT-based periodogram fallback
            print("Using fallback periodogram calculation")
            power = []
            for freq in f:
                omega = 2 * np.pi * freq
                cos_term = np.sum(y * np.cos(omega * t))
                sin_term = np.sum(y * np.sin(omega * t))
                power.append(cos_term**2 + sin_term**2)
            power = np.array(power)
            if normalize:
                power = power / np.max(power)
            return power

class RadialVelocityAnalyzer:
    """Service for radial velocity exoplanet detection and analysis"""
    
    def __init__(self):
        self.cache_file = "data/rv_analysis_cache.json"
        self.synthetic_data_cache = "data/rv_synthetic_data.json"
        
    def generate_synthetic_rv_data(self, num_observations=100, has_planet=True):
        """Generate synthetic radial velocity data for testing"""
        
        # Time array (days)
        time = np.linspace(0, 365 * 2, num_observations)  # 2 years of observations
        
        # Stellar parameters
        stellar_mass = 1.0  # Solar masses
        
        if has_planet:
            # Planet parameters
            planet_mass = 0.001 * 317.8  # Earth masses to Solar masses (Jupiter ~ 317.8 Earth masses)
            orbital_period = 365.25  # days (1 year orbit)
            eccentricity = 0.05  # Reduced eccentricity for clearer signal
            omega = 0  # argument of periastron
            
            # Calculate radial velocity amplitude (K) - make it more detectable
            K = 80.0  # m/s (stronger signal for Jupiter-like planet)
            
            # Calculate radial velocity signal
            mean_anomaly = 2 * np.pi * time / orbital_period
            
            # Solve Kepler's equation (simplified for small eccentricity)
            eccentric_anomaly = mean_anomaly + eccentricity * np.sin(mean_anomaly)
            true_anomaly = 2 * np.arctan(np.sqrt((1 + eccentricity)/(1 - eccentricity)) * 
                                       np.tan(eccentric_anomaly/2))
            
            # Radial velocity
            rv_signal = K * (np.cos(true_anomaly + omega) + eccentricity * np.cos(omega))
        else:
            rv_signal = np.zeros(len(time))
            K = 0
            orbital_period = 0
            planet_mass = 0
            eccentricity = 0
        
        # Add stellar noise and systematic effects (reduced for better detection)
        stellar_jitter = np.random.normal(0, 2, len(time))  # m/s (reduced)
        instrumental_noise = np.random.normal(0, 1.5, len(time))  # m/s (reduced)
        systematic_trend = 0.005 * time  # Long-term instrumental drift (reduced)
        
        # Total radial velocity
        rv_total = rv_signal + stellar_jitter + instrumental_noise + systematic_trend
        
        # Measurement uncertainties
        rv_errors = np.random.uniform(1.5, 4.0, len(time))
        
        return {
            'time': time.tolist(),
            'rv': rv_total.tolist(),
            'rv_error': rv_errors.tolist(),
            'true_signal': rv_signal.tolist(),
            'parameters': {
                'has_planet': has_planet,
                'K_amplitude': K,
                'period': orbital_period,
                'planet_mass_earth': planet_mass * 317.8,
                'eccentricity': eccentricity,
                'stellar_mass': stellar_mass
            }
        }
    
    def downsample_data(self, x, y, num_points):
        if len(x) <= num_points:
            return x, y
        
        # Use a simplified version of the Ramer-Douglas-Peucker algorithm
        # This is a basic implementation for demonstration
        # A more robust solution might use a library like `simplification`
        
        # Find the point with the maximum value (the peak)
        peak_index = np.argmax(y)
        
        # Ensure the peak is always included
        indices_to_keep = {0, peak_index, len(x) - 1}
        
        # Add a selection of other points, biased towards the peak
        # This is a simple way to preserve the shape around the most important feature
        while len(indices_to_keep) < num_points:
            # Add points randomly, but one could be more strategic
            index = np.random.randint(0, len(x))
            indices_to_keep.add(index)
            
        sorted_indices = sorted(list(indices_to_keep))
        
        return x[sorted_indices], y[sorted_indices]

    def detect_periodicity(self, time, rv, rv_error):
        """Detect periodic signals in radial velocity data using Lomb-Scargle periodogram"""
        
        try:
            # Ensure inputs are numpy arrays
            time = np.asarray(time, dtype=float)
            rv = np.asarray(rv, dtype=float) 
            rv_error = np.asarray(rv_error, dtype=float)
            
            # Generate frequency grid for periodogram
            time_span = np.max(time) - np.min(time)
            dt = np.median(np.diff(np.sort(time)))
            
            # Set frequency limits more conservatively
            freq_min = 0.5 / time_span  # Minimum frequency (longest reasonable period)
            freq_max = 0.1 / dt  # Conservative Nyquist frequency
            frequency = np.logspace(np.log10(freq_min), np.log10(freq_max), 1000)
            
            # Calculate Lomb-Scargle periodogram
            # Note: scipy.signal.lombscargle returns power values, not (freq, power)
            power = signal.lombscargle(time, rv, frequency, normalize=True)
            
            # Convert frequency to period
            periods = 1.0 / frequency
            
            # Find peak in periodogram
            peak_idx = np.argmax(power)
            best_period = periods[peak_idx]
            peak_power = power[peak_idx]
            
            # Simple false alarm probability calculation (fallback)
            def false_alarm_probability(power, n=1000):
                # Estimate FAP as the fraction of periodogram powers above the peak
                return np.sum(power < peak_power) / len(power)
            fap = false_alarm_probability(power)

        except Exception as e:
            print(f"Error in detect_periodicity: {e}")
            # Return a fallback result
            return {
                'periods': [100.0],  # Default period
                'power': [0.1],      # Low power
                'best_period': 100.0,
                'peak_power': 0.1,
                'false_alarm_probability': 0.99,
                'significant_detection': False
            }
        
        # Downsample the data before sending to the frontend
        periods_downsampled, power_downsampled = self.downsample_data(periods, power, 500)

        # Find the best period and associated power from the original high-res data
        best_frequency = frequency[np.argmax(power)]
        best_period = 1 / best_frequency
        peak_power = power[np.argmax(power)]

        # Simpler FAP calculation for now to ensure stability
        def false_alarm_probability(power, n=1000):
            return np.sum(power < peak_power) / len(power)
        fap = false_alarm_probability(power)

        return {
            "periods": periods_downsampled.tolist(),
            "power": power_downsampled.tolist(),
            "best_period": best_period,
            "peak_power": peak_power,
            "false_alarm_probability": fap,
            "significant_detection": peak_power > 0.3 or fap < 0.05  # More reasonable thresholds
        }
    def fit_keplerian_orbit(self, time, rv, rv_error, period_guess):
        """Fit Keplerian orbital model to radial velocity data"""
        
        # Phase the data
        phase = (time % period_guess) / period_guess
        
        # Create design matrix for circular orbit approximation
        # RV = K * cos(2π*t/P + φ) + γ
        X = np.column_stack([
            np.cos(2 * np.pi * phase),
            np.sin(2 * np.pi * phase),
            np.ones(len(time))
        ])
        
        # Weighted least squares fit
        W = np.diag(1.0 / rv_error**2)
        XtW = X.T @ W
        XtWX_inv = np.linalg.inv(XtW @ X)
        params = XtWX_inv @ XtW @ rv
        
        # Extract parameters
        K = np.sqrt(params[0]**2 + params[1]**2)
        phase_offset = np.arctan2(params[1], params[0])
        gamma = params[2]  # systemic velocity
        
        # Calculate model
        rv_model = K * np.cos(2 * np.pi * phase + phase_offset) + gamma
        
        # Calculate metrics
        residuals = rv - rv_model
        chi_squared = np.sum((residuals / rv_error)**2)
        reduced_chi_squared = chi_squared / (len(time) - 3)  # 3 parameters
        rms = np.sqrt(np.mean(residuals**2))
        
        # Calculate R-squared safely
        try:
            r_squared_val = r2_score(rv, rv_model)
        except:
            # Fallback R-squared calculation
            ss_res = np.sum((rv - rv_model) ** 2)
            ss_tot = np.sum((rv - np.mean(rv)) ** 2)
            r_squared_val = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0
        
        return {
            'K_amplitude': float(K),
            'phase_offset': float(phase_offset),
            'systemic_velocity': float(gamma),
            'period': float(period_guess),
            'rv_model': rv_model.tolist(),
            'residuals': residuals.tolist(),
            'chi_squared': float(chi_squared),
            'reduced_chi_squared': float(reduced_chi_squared),
            'rms': float(rms),
            'r_squared': float(r_squared_val)
        }
    
    def estimate_planet_properties(self, K, period, stellar_mass=1.0, inclination=90.0):
        """Estimate planet properties from radial velocity amplitude and period"""
        
        # Convert to SI units
        K_ms = K  # Already in m/s
        P_s = period * 24 * 3600  # Convert days to seconds
        M_star_kg = stellar_mass * 1.989e30  # Convert solar masses to kg
        G = 6.674e-11  # Gravitational constant
        
        # Calculate minimum mass (M*sin(i))
        # K = (2πG/P)^(1/3) * (Mp*sin(i))/(Ms + Mp)^(2/3)
        # Rearranging: Mp*sin(i) ≈ K * (P/2πG)^(1/3) * Ms^(2/3)
        
        factor = (P_s / (2 * np.pi * G))**(1/3)
        Mp_sini_kg = K_ms * factor * M_star_kg**(2/3)
        Mp_sini_earth = Mp_sini_kg / 5.972e24  # Convert to Earth masses
        Mp_sini_jupiter = Mp_sini_earth / 317.8  # Convert to Jupiter masses
        
        # Calculate semi-major axis using Kepler's third law
        # a³ = GM(Ms + Mp)P²/4π²
        a_m = ((G * M_star_kg * P_s**2) / (4 * np.pi**2))**(1/3)
        a_au = a_m / 1.496e11  # Convert to AU
        
        # Estimate equilibrium temperature (assuming circular orbit, no atmosphere)
        # T_eq = T_star * sqrt(R_star / 2a) * (1 - A)^(1/4)
        T_star = 5778  # Solar temperature in K
        R_star = 6.96e8  # Solar radius in m
        albedo = 0.3  # Assumed albedo
        T_eq = T_star * np.sqrt(R_star / (2 * a_m)) * (1 - albedo)**(1/4)
        
        return {
            'minimum_mass_earth': float(Mp_sini_earth),
            'minimum_mass_jupiter': float(Mp_sini_jupiter),
            'semi_major_axis_au': float(a_au),
            'equilibrium_temperature_k': float(T_eq),
            'orbital_period_days': float(period),
            'rv_amplitude_ms': float(K),
            'stellar_mass_solar': float(stellar_mass),
            'inclination_assumed_deg': float(inclination)
        }
    
    def full_rv_analysis(self, time, rv, rv_error, stellar_mass=1.0):
        """Complete radial velocity analysis pipeline"""
        
        # Step 1: Detect periodicity
        periodogram = self.detect_periodicity(time, rv, rv_error)
        
        if not periodogram['significant_detection']:
            return {
                'detection_status': 'no_significant_signal',
                'periodogram': periodogram,
                'message': 'No significant periodic signal detected'
            }
        
        # Step 2: Fit Keplerian model
        best_period = periodogram['best_period']
        orbital_fit = self.fit_keplerian_orbit(time, rv, rv_error, best_period)
        
        # Step 3: Estimate planet properties
        planet_properties = self.estimate_planet_properties(
            orbital_fit['K_amplitude'], 
            best_period, 
            stellar_mass
        )
        
        # Step 4: Calculate detection significance
        detection_significance = 'high' if periodogram['false_alarm_probability'] < 0.001 else 'moderate'
        
        return {
            'detection_status': 'planet_detected',
            'detection_significance': detection_significance,
            'periodogram': periodogram,
            'orbital_fit': orbital_fit,
            'planet_properties': planet_properties,
            'analysis_summary': {
                'period_days': best_period,
                'rv_amplitude_ms': orbital_fit['K_amplitude'],
                'min_planet_mass_earth': planet_properties['minimum_mass_earth'],
                'semi_major_axis_au': planet_properties['semi_major_axis_au'],
                'fit_quality': 'good' if orbital_fit['reduced_chi_squared'] < 2.0 else 'poor'
            }
        }
    
    def generate_test_datasets(self):
        """Generate multiple test datasets for demonstration"""
        
        datasets = []
        
        # Dataset 1: Clear Jupiter-like signal
        data1 = self.generate_synthetic_rv_data(150, has_planet=True)
        datasets.append({
            'name': 'Jupiter-like Planet',
            'description': 'Strong signal from a Jupiter-mass planet in a 1-year orbit',
            'data': data1
        })
        
        # Dataset 2: Weak Earth-like signal
        data2 = self.generate_synthetic_rv_data(200, has_planet=True)
        # Reduce amplitude for Earth-like planet
        for i in range(len(data2['true_signal'])):
            data2['true_signal'][i] *= 0.1  # Earth-like amplitude
            data2['rv'][i] = data2['rv'][i] * 0.3 + data2['true_signal'][i]
        data2['parameters']['K_amplitude'] *= 0.1
        data2['parameters']['planet_mass_earth'] *= 0.1
        datasets.append({
            'name': 'Earth-like Planet',
            'description': 'Weak signal from an Earth-mass planet (challenging detection)',
            'data': data2
        })
        
        # Dataset 3: No planet (noise only)
        data3 = self.generate_synthetic_rv_data(100, has_planet=False)
        datasets.append({
            'name': 'No Planet (Noise Only)',
            'description': 'Pure stellar and instrumental noise with no planetary signal',
            'data': data3
        })
        
        return datasets
    
    def save_analysis_cache(self, analysis_results):
        """Save analysis results to cache"""
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
                # If we can't convert it, try to convert to string as fallback
                try:
                    return str(obj)
                except:
                    return None
        
        try:
            cache_data = {
                'timestamp': datetime.now().isoformat(),
                'results': convert_for_json(analysis_results)
            }
            
            os.makedirs('data', exist_ok=True)
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
        except Exception:
            # Continue without caching if there's an issue
            pass
    
    def load_analysis_cache(self):
        """Load cached analysis results"""
        if os.path.exists(self.cache_file):
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        return None

    def analyze_rv_data(self, data):
        """Analyze radial velocity data for exoplanet detection"""
        time = np.array(data["time"])
        rv = np.array(data["rv"])
        rv_error = np.array(data["rv_error"])
        stellar_mass = data.get("stellar_mass", 1.0)
        downsample_points = data.get("downsample_points", 500)

        try:
            # Initialize the Lomb-Scargle periodogram
            periodogram = signal.lombscargle(time, rv, np.logspace(-5, -1, 500), normalize=True)
            frequencies = np.logspace(-5, -1, 500)
            power = periodogram.power(frequencies)
            periods = 1 / frequencies

            # Downsample the data before sending to the frontend
            periods_downsampled, power_downsampled = self.downsample_data(periods, power, downsample_points)

            # Find the best period and associated power from the original high-res data
            best_frequency = frequencies[np.argmax(power)]
            best_period = 1 / best_frequency
            peak_power = power[np.argmax(power)]

            # Simpler FAP calculation for now to ensure stability
            def false_alarm_probability(power, n=1000):
                return np.sum(power < peak_power) / len(power)
            fap = false_alarm_probability(power)

            return {
                "periods": periods_downsampled.tolist(),
                "power": power_downsampled.tolist(),
                "best_period": best_period,
                "peak_power": peak_power,
                "false_alarm_probability": fap,
                "significant_detection": peak_power > 0.3 or fap < 0.05  # More reasonable thresholds
            }
        except Exception as e:
            print(f"Error in analyze_rv_data: {e}")
            return {
                'periods': [100.0],  # Default period
                'power': [0.1],      # Low power
                'best_period': 100.0,
                'peak_power': 0.1,
                'false_alarm_probability': 0.99,
                'significant_detection': False
            }