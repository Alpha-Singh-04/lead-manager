const seedSuperAdmin = require('./superAdminSeeder');
const seedSubAdmins = require('./subAdminSeeder');
const seedAgents = require('./agentSeeder');
const seedLeads = require('./leadSeeder');

const seedAll = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Seed super admin first
    console.log('\n=== Seeding Super Admin ===');
    await seedSuperAdmin();
    
    // Seed subadmins
    console.log('\n=== Seeding Subadmins ===');
    await seedSubAdmins();
    
    // Seed agents
    console.log('\n=== Seeding Agents ===');
    await seedAgents();
    
    // Seed leads
    console.log('\n=== Seeding Leads ===');
    await seedLeads();
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('\nTest Accounts:');
    console.log('Super Admin: superadmin@example.com / password123');
    console.log('Sub Admin: john@example.com / password123');
    console.log('Agent: mike@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder if this file is run directly
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('All seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAll; 