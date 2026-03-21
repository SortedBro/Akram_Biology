const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/akram_biology');
    console.log('✅ MongoDB connected');
    await seedData();
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
}

async function seedData() {
  const { Batch, Admin } = require('../models');

  // Seed default batches if none exist
  const count = await Batch.countDocuments();
  if (count === 0) {
    await Batch.insertMany([
      {
        name: 'Class 11 Morning Batch',
        className: 'Class 11',
        days: ['Monday', 'Wednesday', 'Saturday'],
        time: '4:00 PM – 6:00 PM',
        fee: 600,
        maxStudents: 15,
        currentStudents: 0,
        description: 'NCERT Class 11 Biology – Cell Biology, Diversity, Plant Physiology'
      },
      {
        name: 'Class 12 + NEET Batch',
        className: 'Class 12',
        days: ['Tuesday', 'Thursday', 'Sunday'],
        time: '5:00 PM – 7:00 PM',
        fee: 700,
        maxStudents: 15,
        currentStudents: 0,
        description: 'Class 12 + NEET preparation – Genetics, Human Physiology, Ecology'
      },
      {
        name: 'NEET Dropper Special',
        className: 'NEET Dropper',
        days: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        time: '2:00 PM – 5:00 PM',
        fee: 900,
        maxStudents: 10,
        currentStudents: 0,
        description: 'Intensive NEET Biology revision – complete syllabus + mock tests'
      }
    ]);
    console.log('🌱 Default batches seeded');
  }

  // Seed admin if none exists
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'biology@2025', 10);
    await Admin.create({
      username: process.env.ADMIN_USERNAME || 'akram',
      password: hashed
    });
    console.log('👤 Admin seeded — username: akram, password: biology@2025');
  }
}

module.exports = connectDB;
