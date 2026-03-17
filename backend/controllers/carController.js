const Car = require('../models/Car');

// @desc    Get all cars (with optional filters)
// @route   GET /api/cars
// @access  Public
exports.getAllCars = async (req, res) => {
  try {
    // Filter only unsold cars by default
    const filters = { isSold: false };

    // Optional filters from query parameters
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.minPrice) filters.price = { $gte: req.query.minPrice };
    if (req.query.maxPrice) {
      filters.price = {
        ...filters.price,
        $lte: req.query.maxPrice,
      };
    }
    if (req.query.year) filters.year = req.query.year;

    const cars = await Car.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new car listing
// @route   POST /api/cars
// @access  Public
exports.createCar = async (req, res) => {
  try {
    const { title, brand, model, year, price, mileage, description, seller, images } = req.body;

    // Validate required fields
    if (!title || !brand || !model || !year || !price || !mileage || !description || !seller) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Create car listing
    const car = await Car.create({
      title,
      brand,
      model,
      year,
      price,
      mileage,
      description,
      seller,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: 'Car listing created successfully',
      data: car,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update car listing
// @route   PUT /api/cars/:id
// @access  Public (should be protected in production)
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Prevent updating sold cars
    if (car.isSold) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a sold car',
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Car listing updated successfully',
      data: car,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete car listing
// @route   DELETE /api/cars/:id
// @access  Public (should be protected in production)
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    // Only allow deletion if not sold
    if (car.isSold) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a sold car',
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Car listing deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark car as sold
// @route   PATCH /api/cars/:id/sold
// @access  Public
exports.markCarAsSold = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { isSold: true },
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Car marked as sold',
      data: car,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
