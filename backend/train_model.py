import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

def train():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'investment_recommendations_10000.csv')
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    print("Loading dataset...")
    df = pd.read_csv(data_path)

    # Features: Individual Goals, Age, Gender, Risk Tolerance, Financial Literacy
    # Target: Recommended Investment Products
    
    # 1. Clean data and drop NA
    df = df.dropna()

    # 2. Encode categorical features
    print("Encoding categorical features...")
    le_goals = LabelEncoder()
    df['Individual Goals Encoded'] = le_goals.fit_transform(df['Individual Goals'])
    
    le_gender = LabelEncoder()
    df['Gender Encoded'] = le_gender.fit_transform(df['Gender'])
    
    le_risk = LabelEncoder()
    # Risk Tolerance might have order, but LabelEncoder is fine for Random Forest
    df['Risk Tolerance Encoded'] = le_risk.fit_transform(df['Risk Tolerance'])

    X = df[['Individual Goals Encoded', 'Age', 'Gender Encoded', 'Risk Tolerance Encoded', 'Financial Literacy']]
    y = df['Recommended Investment Products']

    # 3. Train Model
    print("Training Random Forest Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X, y)

    # 4. Save model and encoders
    model_data = {
        'model': clf,
        'le_goals': le_goals,
        'le_gender': le_gender,
        'le_risk': le_risk,
        # fallback default if label is unseen
        'goals_classes': list(le_goals.classes_),
        'gender_classes': list(le_gender.classes_),
        'risk_classes': list(le_risk.classes_)
    }

    model_out_path = os.path.join(os.path.dirname(__file__), 'investment_model.pkl')
    with open(model_out_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    print(f"Model successfully trained and saved to {model_out_path}")

if __name__ == "__main__":
    train()
