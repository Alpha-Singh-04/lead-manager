const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI.replace(/\/$/, '') + '/lead-manager';

const agents = [
  { name: 'Mike Agent', email: 'mike@example.com', password: 'password123', role: 'agent' },
  { name: 'Lisa Agent', email: 'lisa@example.com', password: 'password123', role: 'agent' },
  { name: 'David Agent', email: 'david@example.com', password: 'password123', role: 'agent' },
  { name: 'Emma Agent', email: 'emma@example.com', password: 'password123', role: 'agent' }
];

const seedAgents = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    // Clear existing agents
    await User.deleteMany({ role: 'agent' });

    // Create agents
    const createdAgents = await Promise.all(
      agents.map(async (agent) => {
        const createdAgent = await User.create(agent);
        return createdAgent;
      })
    );

    return createdAgents;
  } catch (error) {
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeder if this file is run directly
if (require.main === module) {
  seedAgents()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = seedAgents;