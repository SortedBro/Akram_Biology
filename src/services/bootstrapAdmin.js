const env = require('../config/env');
const User = require('../models/User');

async function bootstrapAdmin() {
  const email = String(env.adminEmail || '').toLowerCase().trim();
  const password = String(env.adminPassword || '');

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn('Admin bootstrap skipped: ADMIN_EMAIL or ADMIN_PASSWORD missing.');
    return;
  }

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      fullName: 'System Admin',
      email,
      password,
      role: 'admin',
      isActive: true
    });

    // eslint-disable-next-line no-console
    console.log(`Admin bootstrap: created ${admin.email}`);
    return;
  }

  if (env.nodeEnv !== 'production') {
    admin.fullName = admin.fullName || 'System Admin';
    admin.role = 'admin';
    admin.isActive = true;
    admin.password = password;
    await admin.save();
    // eslint-disable-next-line no-console
    console.log(`Admin bootstrap: synced password for ${admin.email}`);
  }
}

module.exports = bootstrapAdmin;
