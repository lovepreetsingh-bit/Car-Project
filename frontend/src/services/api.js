// services/api.js - API service for all backend calls
import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

export const authAPI = {
  register: (payload) => API.post('/auth/register', payload),
  login: (payload) => API.post('/auth/login', payload),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
};

export const chatAPI = {
  startChat: (carId) => API.post('/chats/start', { carId }),
  getMyChats: () => API.get('/chats'),
  getChatMessages: (chatId) => API.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId, content) => API.post(`/chats/${chatId}/messages`, { content }),
};

export default API;
