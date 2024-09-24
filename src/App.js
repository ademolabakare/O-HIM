// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapPage from './components/MapPage';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard'; // Placeholder for the dashboard page
import '@fortawesome/fontawesome-free/css/all.min.css';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
