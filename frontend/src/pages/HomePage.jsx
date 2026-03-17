// pages/HomePage.jsx - Display all available cars
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { carAPI } from '../services/api';

const HomePage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ brand: '', minPrice: '', maxPrice: '' });

  // Fetch all cars on component mount
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getAllCars();
      setCars(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cars. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getFilteredCars(filters);
      setCars(response.data.data);
    } catch (err) {
      setError('Failed to apply filters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Car Selling Platform</h1>
          <p className="text-blue-100">Find your perfect car or list yours for sale</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Add New Listing Button */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Available Cars</h2>
          <Link
            to="/add-car"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            + Add New Car
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">Filter Cars</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="brand"
              placeholder="Brand (e.g., Toyota)"
              value={filters.brand}
              onChange={handleFilterChange}
              className="border rounded px-4 py-2"
            />
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="border rounded px-4 py-2"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="border rounded px-4 py-2"
            />
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-xl">Loading cars...</p>
          </div>
        )}

        {/* Cars Grid */}
        {!loading && cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">No cars found. Be the first to list one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
