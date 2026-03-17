// pages/CarDetailPage.jsx - Display detailed car information
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carAPI } from '../services/api';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await carAPI.getCarById(id);
        setCar(response.data.data);
      } catch (err) {
        setError('Failed to fetch car details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await carAPI.deleteCar(id);
        alert('Car listing deleted successfully!');
        navigate('/');
      } catch (err) {
        alert('Failed to delete car listing.');
      }
    }
  };

  const handleMarkAsSold = async () => {
    if (window.confirm('Mark this car as sold?')) {
      try {
        await carAPI.markCarAsSold(id);
        alert('Car marked as sold!');
        navigate('/');
      } catch (err) {
        alert('Failed to mark car as sold.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-xl">Loading car details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-xl">Car not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Listings
        </button>
      </div>

      {/* Car Details */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Gallery */}
          <div className="relative bg-gray-900">
            {car.images && car.images.length > 0 ? (
              <div>
                <img
                  src={car.images[currentImageIndex]}
                  alt={car.title}
                  className="w-full h-96 object-cover"
                />
                {car.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {car.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Details Container */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Car Info */}
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{car.title}</h1>
                <p className="text-gray-600 text-lg mb-6">
                  {car.year} {car.brand} {car.model}
                </p>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Price</p>
                    <p className="text-2xl font-bold text-blue-600">${car.price.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-gray-600 text-sm">Mileage</p>
                    <p className="text-2xl font-bold text-green-600">{car.mileage.toLocaleString()} km</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                </div>

                {/* Additional Info */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Listed on: {new Date(car.createdAt).toLocaleDateString()}
                  </p>
                  {car.isSold && (
                    <p className="text-red-600 font-semibold">This car has been sold</p>
                  )}
                </div>
              </div>

              {/* Right Column - Seller Info */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Seller Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-sm">Name</p>
                      <p className="text-gray-800 font-semibold">{car.seller.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <a href={`mailto:${car.seller.email}`} className="text-blue-600 hover:underline">
                        {car.seller.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Phone</p>
                      <a href={`tel:${car.seller.phone}`} className="text-blue-600 hover:underline">
                        {car.seller.phone}
                      </a>
                    </div>
                    {car.seller.city && (
                      <div>
                        <p className="text-gray-500 text-sm">City</p>
                        <p className="text-gray-800 font-semibold">{car.seller.city}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!car.isSold && (
                  <div className="space-y-2">
                    <button
                      onClick={handleMarkAsSold}
                      className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition"
                    >
                      Mark as Sold
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                    >
                      Delete Listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
