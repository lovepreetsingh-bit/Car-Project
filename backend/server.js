const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

if (!mongoUri) {
  console.error(
    'Missing MONGODB_URI environment variable.\n' +
    'Please create a .env file in backend/ with:\n' +
    'MONGODB_URI=mongodb://localhost:27017/car-selling-db\n' +
    'or use your MongoDB Atlas connection string.'
  );
  process.exit(1);
}

if (!jwtSecret || !jwtSecret.trim()) {
  console.error(
    'Missing JWT_SECRET environment variable.\n' +
    'Please add JWT_SECRET=<your-long-random-secret> in backend/.env'
  );
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Car Selling API", success: true });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token || '';
    const rawToken = authToken.startsWith('Bearer ') ? authToken.split(' ')[1] : authToken;

    if (!rawToken) {
      return next(new Error('Authentication token missing'));
    }

    const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', async (socket) => {
  const userId = String(socket.user._id);
  socket.join(userId);

  // Join all chat rooms where this user is a participant
  const chats = await Chat.find({
    $or: [{ buyer: socket.user._id }, { seller: socket.user._id }],
  }).select('_id');

  chats.forEach((chat) => socket.join(String(chat._id)));

  socket.on('chat:join', (chatId) => {
    socket.join(String(chatId));
  });

  socket.on('disconnect', () => {
    // No cleanup needed currently
  });
});
