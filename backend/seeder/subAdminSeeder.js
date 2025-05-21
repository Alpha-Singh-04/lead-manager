const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI.replace(/\/$/, '') + '/lead-manager';

const subAdmins = [
  { name: 'John Manager', email: 'john@example.com', password: 'password123', role: 'subadmin' },
  { name: 'Sarah Manager', email: 'sarah@example.com', password: 'password123', role: 'subadmin' }
];

const seedSubAdmins = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    // Clear existing subadmins
    await User.deleteMany({ role: 'subadmin' });

    // Create subadmins
    const createdSubAdmins = await Promise.all(
      subAdmins.map(async (admin) => {
        const createdAdmin = await User.create(admin);
        return createdAdmin;
      })
    );

    return createdSubAdmins;
  } catch (error) {
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeder if this file is run directly
if (require.main === module) {
  seedSubAdmins()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = seedSubAdmins; 