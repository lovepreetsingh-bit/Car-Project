const mongoose = require('mongoose');

// Car Schema - Defines the structure of a car listing
const carSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Car title is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Car brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Car model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Car year is required'],
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    price: {
      type: Number,
      required: [true, 'Car price is required'],
      min: 0,
    },
    mileage: {
      type: Number,
      required: [true, 'Car mileage is required'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Car description is required'],
      maxlength: 1000,
    },
    images: {
      type: [String], // Array of image URLs
      default: [],
    },
    seller: {
      name: {
        type: String,
        required: [true, 'Seller name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Seller email is required'],
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: [true, 'Seller phone is required'],
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
    },
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create and export the Car model
module.exports = mongoose.model('Car', carSchema);
