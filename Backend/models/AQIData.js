const mongoose = require('mongoose');

const AQISchema = new mongoose.Schema({
    city: String,
    aqi: Number,
    pm25: Number,
    pm10: Number,
    no2: Number,
    source: { type: String, default: 'Satellite' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AQIData', AQISchema);