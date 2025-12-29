# import sys
# import joblib
# import numpy as np

# # Load pre-trained model
# model = joblib.load('../models/aqi_model.pkl')

# def predict():
#     # Inputs: pm25, pm10, no2
#     features = np.array([float(x) for x in sys.argv[1:]]).reshape(1, -1)
#     prediction = model.predict(features)
#     print(prediction[0])

# if __name__ == "__main__":
#     predict()

import sys
import joblib
import numpy as np
import os

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'aqi_model.pkl')

# Load pre-trained model using the absolute path
model = joblib.load(model_path)

def predict():
    try:
        # Inputs: pm25, pm10, no2 from sys.argv
        if len(sys.argv) < 4:
            return # Don't print anything if inputs are missing
            
        features = np.array([float(x) for x in sys.argv[1:]]).reshape(1, -1)
        prediction = model.predict(features)
        
        # ONLY print the final result - no other text allowed!
        print(prediction[0])
    except Exception as e:
        sys.stderr.write(str(e)) # Send error to stderr so Node.js can catch it
        sys.exit(1)

if __name__ == "__main__":
    predict()