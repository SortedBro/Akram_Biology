const mongoose = require('mongoose');
const env = require('../src/config/env');
const connectDatabase = require('../src/config/database');
const User = require('../src/models/User');

async function seedAdmin() {
  await connectDatabase();

  const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (existing) {
    existing.fullName = 'System Admin';
    existing.password = env.adminPassword;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`Admin updated: ${env.adminEmail}`);
  } else {
    await User.create({
      fullName: 'System Admin',
      email: env.adminEmail,
      password: env.adminPassword,
      role: 'admin'
    });
    // eslint-disable-next-line no-console
    console.log(`Admin created: ${env.adminEmail}`);
  }
}

seedAdmin()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
