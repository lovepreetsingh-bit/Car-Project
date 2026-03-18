const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/auth');

// @route   GET /api/cars
// @desc    Get all car listings
router.get('/', carController.getAllCars);

// @route   GET /api/cars/:id
// @desc    Get single car by ID
router.get('/:id', carController.getCarById);

// @route   POST /api/cars
// @desc    Create new car listing
router.post('/', protect, carController.createCar);

// @route   PUT /api/cars/:id
// @desc    Update car listing
router.put('/:id', protect, carController.updateCar);

// @route   DELETE /api/cars/:id
// @desc    Delete car listing
router.delete('/:id', protect, carController.deleteCar);

// @route   PATCH /api/cars/:id/sold
// @desc    Mark car as sold
router.patch('/:id/sold', protect, carController.markCarAsSold);

module.exports = router;
