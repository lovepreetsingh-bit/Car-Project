require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Car = require('../models/Car');
const User = require('../models/User');

const createRandomPassword = () => crypto.randomBytes(24).toString('hex');

const normalizeEmail = (email) => (email || '').toLowerCase().trim();

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const legacyCars = await Car.find({
    $or: [{ postedBy: { $exists: false } }, { postedBy: null }, { 'seller.userId': { $exists: false } }, { 'seller.userId': null }],
  });

  console.log(`Found ${legacyCars.length} legacy car listing(s) to process`);

  let updatedCars = 0;
  let createdUsers = 0;
  let skippedCars = 0;

  for (const car of legacyCars) {
    const sellerEmail = normalizeEmail(car.seller?.email);
    const sellerName = (car.seller?.name || '').trim();
    const sellerPhone = (car.seller?.phone || '').trim();

    if (!sellerEmail || !sellerName || !sellerPhone) {
      skippedCars += 1;
      console.log(`Skipped car ${car._id}: missing seller name/email/phone`);
      continue;
    }

    let user = await User.findOne({ email: sellerEmail });
    if (!user) {
      const hashedPassword = await bcrypt.hash(createRandomPassword(), 12);
      user = await User.create({
        name: sellerName,
        email: sellerEmail,
        phone: sellerPhone,
        password: hashedPassword,
      });
      createdUsers += 1;
      console.log(`Created user ${user._id} for seller email ${sellerEmail}`);
    }

    car.postedBy = user._id;
    car.seller.userId = user._id;

    if (!car.seller.name) car.seller.name = user.name;
    if (!car.seller.email) car.seller.email = user.email;
    if (!car.seller.phone) car.seller.phone = user.phone;

    await car.save();
    updatedCars += 1;
  }

  console.log('Migration completed');
  console.log(`Updated cars: ${updatedCars}`);
  console.log(`Created users: ${createdUsers}`);
  console.log(`Skipped cars: ${skippedCars}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

run().catch(async (error) => {
  console.error('Migration failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_err) {
    // no-op
  }
  process.exit(1);
});
