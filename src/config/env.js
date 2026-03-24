const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  appName: process.env.APP_NAME || 'Akram Bio-Care',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/akram_biocare',
  sessionSecret: process.env.SESSION_SECRET || 'please-change-session-secret',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@akrambiocare.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe@123'
};

module.exports = env;
