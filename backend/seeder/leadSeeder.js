const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI.replace(/\/$/, '') + '/lead-manager';

// Sample data for leads
const leadSources = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Cold Call', 'Trade Show'];
const leadStatuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
const leadTags = ['Hot', 'Warm', 'Cold', 'VIP', 'Enterprise', 'SMB', 'Startup'];

// Function to generate a random lead
const generateLead = (agents) => {
  const randomAgent = agents[Math.floor(Math.random() * agents.length)];
  const randomSource = leadSources[Math.floor(Math.random() * leadSources.length)];
  const randomStatus = leadStatuses[Math.floor(Math.random() * leadStatuses.length)];
  const randomTags = Array.from(
    { length: Math.floor(Math.random() * 3) + 1 },
    () => leadTags[Math.floor(Math.random() * leadTags.length)]
  );
  const randomNotes = [
    'Initial contact made',
    'Follow-up required',
    'Product demo scheduled',
    'Price quote sent',
    'Contract negotiation in progress'
  ].slice(0, Math.floor(Math.random() * 3) + 1);

  return {
    name: `Lead ${Math.floor(Math.random() * 1000)}`,
    email: `lead${Math.floor(Math.random() * 1000)}@example.com`,
    phone: `+1${Math.floor(Math.random() * 1000000000)}`,
    source: randomSource,
    status: randomStatus,
    tags: randomTags,
    notes: randomNotes,
    assignedTo: randomAgent._id,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
  };
};

const seedLeads = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    // Get all agents
    const agents = await User.find({ role: 'agent' });
    if (agents.length === 0) {
      throw new Error('No agents found. Please seed agents first.');
    }

    // Clear existing leads
    await Lead.deleteMany({});

    // Generate and create leads
    const numberOfLeads = 50; // You can adjust this number
    const leads = Array.from({ length: numberOfLeads }, () => generateLead(agents));
    
    await Lead.insertMany(leads);

    // Verify data
    const leadCount = await Lead.countDocuments();

    // Log some statistics
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    statusCounts.forEach(status => {
      console.log(`${status._id}: ${status.count}`);
    });

    return leads;
  } catch (error) {
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// Run the seeder if this file is run directly
if (require.main === module) {
  seedLeads()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Lead seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedLeads; 