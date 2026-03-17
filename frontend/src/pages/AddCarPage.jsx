// pages/AddCarPage.jsx - Form to create new car listing
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carAPI } from '../services/api';

const AddCarPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    description: '',
    images: [],
    seller: {
      name: '',
      email: '',
      phone: '',
      city: '',
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('seller.')) {
      const field = name.replace('seller.', '');
      setFormData({
        ...formData,
        seller: { ...formData.seller, [field]: value },
      });
    } else {
      setFormData({
        ...formData,
        [name]: ['year', 'price', 'mileage'].includes(name) ? Number(value) : value,
      });
    }
  };

  const handleImageUrlAdd = (e) => {
    const url = e.target.value;
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url],
      });
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title || !formData.brand || !formData.model || !formData.price || !formData.mileage || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.seller.name || !formData.seller.email || !formData.seller.phone) {
      setError('Please fill in all seller information');
      return;
    }

    try {
      setLoading(true);
      await carAPI.createCar(formData);
      alert('Car listing created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create car listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">List Your Car for Sale</h1>
          <p className="text-green-100">Fill in the details below to create a new listing</p>
        </div>
      </header>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Car Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Car Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Car Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Honda Civic 2020"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Honda"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Civic"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 15000"
                  min="0"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mileage (km) *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  min="0"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the condition, features, and history of the car..."
                rows="4"
                maxLength="1000"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <p className="text-gray-500 text-sm mt-1">{formData.description.length}/1000 characters</p>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Car Images</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Add Image URL</label>
              <input
                type="url"
                placeholder="Paste image URL and press Enter..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleImageUrlAdd(e);
                  }
                }}
                onBlur={(e) => formData.images.length < 5 && handleImageUrlAdd(e)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-gray-500 text-sm mt-1">Add up to 5 images</p>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Car ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seller Information Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="seller.name"
                  value={formData.seller.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="seller.email"
                  value={formData.seller.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="seller.phone"
                  value={formData.seller.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">City</label>
                <input
                  type="text"
                  name="seller.city"
                  value={formData.seller.city}
                  onChange={handleInputChange}
                  placeholder="Your city"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCarPage;
