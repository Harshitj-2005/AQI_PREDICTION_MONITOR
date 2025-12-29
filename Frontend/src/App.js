import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Wind, Activity, Thermometer, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const App = () => {
  const [coords, setCoords] = useState([28.6139, 77.2090]);
  const [city, setCity] = useState('New Delhi');
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');

  const predict = async (lat, lon, cityName) => {
    try {
      // Assuming your backend returns a 'temp' field now
      const res = await axios.post('http://localhost:5000/api/aqi/predict', { lat, lon, city: cityName });
      setData(res.data);
      
      const hist = await axios.get('http://localhost:5000/api/aqi/history');
      setHistory(hist.data.reverse());
    } catch (e) { 
      console.error("API Error", e); 
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${search}`);
      if (res.data[0]) {
        const { lat, lon, display_name } = res.data[0];
        const newCoords = [parseFloat(lat), parseFloat(lon)];
        setCoords(newCoords);
        setCity(display_name.split(',')[0]);
        predict(lat, lon, display_name.split(',')[0]);
      }
    } catch (e) { console.error("Search Error", e); }
  };

  function MapEvents() {
  const map = useMap();
  
  useEffect(() => {
    // This "fix" ensures the map calculates its size correctly on first render
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
    
    map.setView(coords, 12);
  }, [coords, map]);

  return <Marker position={coords} />;
}

  return (
    <div className="page-wrapper">
      <div className="dashboard-container">
        
        <header className="header">
          <div className="logo"><Wind size={24} /> AQI <span>Monitor</span></div>
          <form onSubmit={handleSearch}>
            <input 
              className="search-box" 
              placeholder="Search global cities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </header>

        <aside className="sidebar">
          <div className="glass-card main-stats">
            <span className="live-badge">LIVE FEED</span>
            <h2 className="city-title"><MapPin size={18} /> {city}</h2>
            
            <div className="aqi-display">
                <div className="aqi-value">{data ? Math.round(data.aqi) : "--"}</div>
                <p className="label">AI Predicted AQI</p>
            </div>
            
            <div className="pollutant-grid">
              <div className="stat-box temp">
                <Thermometer size={16} color="#fbbf24" />
                <small>TEMP</small>
                <p>{data?.temp || 0}°C</p>
              </div>
              <div className="stat-box">
                <small>PM2.5</small>
                <p>{data?.pm25 || 0}</p>
              </div>
              <div className="stat-box">
                <small>PM10</small>
                <p>{data?.pm10 || 0}</p>
              </div>
              <div className="stat-box">
                <small>NO2</small>
                <p>{data?.no2 || 0}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="map-wrapper">
            <MapContainer center={coords} zoom={12} className="leaflet-container" scrollWheelZoom={true}>
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              />
              <MapEvents />
            </MapContainer>
          </div>

          <div className="glass-card chart-card">
             <h4 className="chart-title"><Activity size={16}/> History Trend</h4>
             <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b'}} />
                        <Area type="monotone" dataKey="aqi" stroke="var(--accent-cyan)" fillOpacity={1} fill="url(#colorAqi)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;