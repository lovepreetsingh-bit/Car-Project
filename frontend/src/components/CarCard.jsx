// components/CarCard.jsx - Reusable car listing card component
import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Car Image */}
      <div className="w-full h-48 bg-gray-200 overflow-hidden">
        {car.images && car.images.length > 0 ? (
          <img
            src={car.images[0]}
            alt={car.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* Car Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 truncate">{car.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          {car.year} {car.brand} {car.model}
        </p>

        {/* Price and Mileage */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-400">Price</p>
            <p className="text-lg font-bold text-blue-600">${car.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Mileage</p>
            <p className="text-lg font-semibold text-gray-700">{car.mileage.toLocaleString()} km</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="border-t pt-2 mb-3">
          <p className="text-xs text-gray-500">Seller: <span className="font-semibold">{car.seller.name}</span></p>
          <p className="text-xs text-gray-500">Phone: <span className="font-semibold">{car.seller.phone}</span></p>
        </div>

        {/* View Details Button */}
        <Link
          to={`/car/${car._id}`}
          className="w-full block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
