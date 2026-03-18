const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    const error = new Error('Server configuration error: JWT_SECRET is missing.');
    error.statusCode = 500;
    throw error;
  }
  return secret;
};

const signToken = (userId) =>
  jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!name || !normalizedEmail || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password and phone.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    const token = signToken(user._id);
    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? error.message : 'Registration failed.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = signToken(user._id);
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Login failed due to server configuration.' : error.message,
    });
  }
};

exports.getMe = async (req, res) =>
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });

exports.logout = async (_req, res) =>
  res.status(200).json({
    success: true,
    message: 'Logout successful on client side. Remove token from storage.',
  });
