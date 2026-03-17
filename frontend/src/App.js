// App.js - Main application component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CarDetailPage from './pages/CarDetailPage';
import AddCarPage from './pages/AddCarPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/car/:id" element={<CarDetailPage />} />
        <Route path="/add-car" element={<AddCarPage />} />
      </Routes>
    </Router>
  );
}

export default App;
