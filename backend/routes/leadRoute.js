const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { addLead, getAllLeads, updateLead, deleteLead, getMyLeads, exportLeads, getDashboardStats } = require('../controllers/leadController');
const router = express.Router();

// Dashboard stats (Accessible by Superadmin, Subadmin, and Agent)
router.get('/dashboard', authMiddleware, roleMiddleware(['superadmin', 'subadmin', 'agent']), getDashboardStats);

// Export leads (Accessible by Superadmin and Subadmin)
router.get('/export', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), exportLeads);

// Get all leads (Accessible by Superadmin and Subadmin)
router.get('/', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), getAllLeads);

// Create lead (Accessible by Superadmin and Subadmin)
router.post('/', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), addLead);

// Update lead (Accessible by Superadmin and Subadmin)
router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), updateLead);

// Delete lead (Accessible by Superadmin and Subadmin)
router.delete('/:id', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), deleteLead);

// Get leads assigned to current user (Accessible by Agent)
router.get('/mine', authMiddleware, roleMiddleware(['agent']), getMyLeads);

module.exports = router;