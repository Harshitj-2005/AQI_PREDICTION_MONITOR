const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const axios = require('axios');
const AQIData = require('../models/AQIData');

// @route   POST /api/aqi/predict
// @desc    Fetch real satellite data and return AI prediction
router.post('/predict', async (req, res) => {
    try {
        const { lat, lon, city } = req.body;

        // 1. Fetch Real Satellite Data from OpenWeather
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        
        const poll = response.data.list[0].components;

        // 2. Run Python AI Script
        // NOTE: Adjust '../ml/predict_script.py' if your file is in a different folder
        const python = spawn('python', [
            '../models/predict_script.py', 
            poll.pm2_5, 
            poll.pm10, 
            poll.no2
        ]);
        // Add this right after you define 'const python = ...'
python.stderr.on('data', (data) => {
    console.error(`🐍 Python Error: ${data.toString()}`);
});

        let pythonData = "";

        python.stdout.on('data', (data) => {
            pythonData += data.toString();
        });

        python.on('close', async (code) => {
            if (code !== 0) {
                return res.status(500).json({ message: "Python script failed" });
            }

            const predictedAQI = parseFloat(pythonData.trim());

            // 3. Save the Real Data + Prediction to MongoDB
            const newRecord = await AQIData.create({
                city: city || "Unknown Location",
                aqi: predictedAQI,
                pm25: poll.pm2_5,
                pm10: poll.pm10,
                no2: poll.no2,
                timestamp: new Date()
            });

            res.json(newRecord);
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Satellite Link Failed", error: err.message });
    }
});

// @route   GET /api/aqi/history
router.get('/history', async (req, res) => {
    try {
        const history = await AQIData.find().sort({ timestamp: -1 }).limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;