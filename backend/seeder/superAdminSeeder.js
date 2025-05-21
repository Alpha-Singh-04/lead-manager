const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI.replace(/\/$/, '') + '/lead-manager';

const superAdmin = {
  name: 'Super Admin',
  email: 'superadmin@example.com',
  password: 'password123',
  role: 'superadmin'
};

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return existingSuperAdmin;
    }

    // Create super admin
    const createdSuperAdmin = await User.create(superAdmin);

    // Verify the user was created
    const verifyUser = await User.findOne({ email: 'superadmin@example.com' });
    if (verifyUser) {
      console.log('User details:', {
        email: verifyUser.email,
        role: verifyUser.role,
        hasPassword: !!verifyUser.password
      });
    }

    return createdSuperAdmin;
  } catch (error) {
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeder if this file is run directly
if (require.main === module) {
  seedSuperAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = seedSuperAdmin; 