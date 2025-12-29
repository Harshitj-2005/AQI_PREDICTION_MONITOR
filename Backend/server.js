const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Linking the aqiRoutes file
const aqiRoutes = require('./routes/aqiRoutes'); 
app.use('/api/aqi', aqiRoutes); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});