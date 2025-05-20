const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { addLead, updateLead, deleteLead, getMyLeads, exportLeads } = require('../controllers/leadController');
const router = express.Router();

// Export leads
router.get('/export', authMiddleware, exportLeads);

// Create lead
router.post('/', authMiddleware, roleMiddleware(["super-admin", "sub-admin"]), addLead);

// Update lead
router.put('/:id', authMiddleware, roleMiddleware(["super-admin", "sub-admin"]), updateLead);

// Delete lead
router.delete('/:id', authMiddleware, roleMiddleware(["super-admin", "sub-admin"]), deleteLead);

// Get leads assigned to current user (support agent)
router.get('/mine', authMiddleware, getMyLeads);

module.exports = router;