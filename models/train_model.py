import pandas as pd
from pymongo import MongoClient
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from dotenv import load_dotenv

# Load database URI from the backend .env file
load_dotenv('../backend/.env')

def train_from_database():
    print("🔄 Connecting to MongoDB...")
    
    try:
        # 1. Connect to MongoDB
        client = MongoClient(os.getenv('MONGO_URI'))
        db = client['aqi_db'] # This should match your database name
        collection = db['aqidatas']
        
        # 2. Fetch data from DB
        data = list(collection.find())
        
        if len(data) < 20:
            print("⚠️ Not enough data in database to train yet. Need at least 20 records.")
            return

        # 3. Convert to Dataframe
        df = pd.DataFrame(data)
        
        # 4. Prepare Features (Inputs) and Target (Output)
        # Ensure these column names match what your backend saves
        X = df[['pm25', 'pm10', 'no2']]
        y = df['aqi']
        
        # 5. Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # 6. Initialize and Train the Model
        print(f"🧠 Training model on {len(X_train)} records...")
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        # 7. Check Accuracy
        score = model.score(X_test, y_test)
        print(f"✅ Training Complete. Model Accuracy (R²): {score:.4f}")
        
        # 8. Save the newly trained model
        # This overwrites the old .pkl file so the server uses the updated version
        model_filename = 'aqi_model.pkl'
        joblib.dump(model, model_filename)
        print(f"💾 Model saved to {model_filename}")

    except Exception as e:
        print(f"❌ Error during training: {e}")

if __name__ == "__main__":
    train_from_database()