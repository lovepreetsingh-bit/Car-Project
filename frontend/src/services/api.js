// services/api.js - API service for all backend calls
import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Car API endpoints
export const carAPI = {
  // Get all cars
  getAllCars: () => API.get('/cars'),

  // Get single car by ID
  getCarById: (id) => API.get(`/cars/${id}`),

  // Create new car listing
  createCar: (carData) => API.post('/cars', carData),

  // Update car listing
  updateCar: (id, carData) => API.put(`/cars/${id}`, carData),

  // Delete car listing
  deleteCar: (id) => API.delete(`/cars/${id}`),

  // Mark car as sold
  markCarAsSold: (id) => API.patch(`/cars/${id}/sold`),

  // Get cars with filters
  getFilteredCars: (filters) => API.get('/cars', { params: filters }),
};

export default API;
