import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib # Saves and loads the objects/data
import os
import requests
import io

def train_model():
    print("Fetching real UCI Heart Disease dataset...")
    
    # UCI Heart Disease dataset URL (Cleveland)
    url = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
    
    # Column names for the dataset
    columns = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 
        'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'target'
    ]
    
    try:
        # Download the dataset
        response = requests.get(url)
        response.raise_for_status()
        
        # Read the data
        df = pd.read_csv(io.StringIO(response.text), names=columns, na_values='?')
        
        # Simple preprocessing: drop rows with missing values (UCI dataset has a few)
        df = df.dropna()
        
        # Convert target: UCI has 0 (no disease) and 1-4 (severity). 
        # We'll simplify to binary classification: 0 (No) and 1 (Yes)
        df['target'] = df['target'].apply(lambda x: 1 if x > 0 else 0)
        
        X = df.drop('target', axis=1)
        y = df['target']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Random Forest
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # Calculate accuracy
        accuracy = model.score(X_test, y_test)
        print(f"Model trained successfully! Test Accuracy: {accuracy:.2%}")
        
        # Save feature importance for later use in explanations
        feature_importance = dict(zip(X.columns, model.feature_importances_))
        
        # Ensure the directory exists
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)
        
        # Save both model and feature metadata
        model_data = {
            'model': model,
            'features': list(X.columns),
            'importance': feature_importance,
            'accuracy': accuracy
        }
        
        model_path = os.path.join(models_dir, 'heart_disease_model.pkl')
        joblib.dump(model_data, model_path)
        print(f"Model and metadata saved to {model_path}")
        
    except Exception as e:
        print(f"Error fetching real data: {e}")
        print("Falling back to synthetic data training...")
        # (Snippet of previous synthetic logic just in case)
        data = {
            'age': np.random.randint(20, 80, 500),
            'sex': np.random.randint(0, 2, 500),
            'cp': np.random.randint(0, 4, 500),
            'trestbps': np.random.randint(90, 200, 500),
            'chol': np.random.randint(120, 400, 500),
            'fbs': np.random.randint(0, 2, 500),
            'restecg': np.random.randint(0, 3, 500),
            'thalach': np.random.randint(70, 200, 500),
            'exang': np.random.randint(0, 2, 500),
            'oldpeak': np.random.uniform(0, 6, 500),
            'slope': np.random.randint(0, 3, 500),
            'ca': np.random.randint(0, 5, 500),
            'thal': np.random.randint(0, 4, 500),
            'target': np.random.randint(0, 2, 500)
        }
        df = pd.DataFrame(data)
        X = df.drop('target', axis=1)
        y = df['target']
        model = RandomForestClassifier(n_estimators=100)
        model.fit(X, y)
        feature_importance = dict(zip(X.columns, model.feature_importances_))
        model_data = {'model': model, 'features': list(X.columns), 'importance': feature_importance, 'accuracy': 0.5}
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, 'models', 'heart_disease_model.pkl')
        joblib.dump(model_data, model_path)

if __name__ == "__main__":
    train_model()
