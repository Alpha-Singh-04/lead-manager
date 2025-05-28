const express = require('express');
const multer = require('multer');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { addLead, getAllLeads, updateLead, deleteLead, getMyLeads, exportLeads, importLeads ,getDashboardStats } = require('../controllers/leadController');
const router = express.Router();

function safeRouterUse(router, method, path, ...handlers) {
  if (typeof path !== 'string' || path.trim() === '' || /^:/.test(path) || /:\s*$/.test(path)) {
    throw new Error(`Malformed router path detected: '${path}'`);
  }
  console.log(`Registering router path [${method.toUpperCase()}]:`, path);
  router[method](path, ...handlers);
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Dashboard stats (Accessible by Superadmin, Subadmin, and Agent)
safeRouterUse(router, 'get', '/dashboard', authMiddleware, roleMiddleware(['superadmin', 'subadmin', 'agent']), getDashboardStats);

// Export leads (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'get', '/export', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), exportLeads);

// Import leads (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'post', '/import', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), upload.single('file'), importLeads);

// Get all leads (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'get', '/', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), getAllLeads);

// Create lead (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'post', '/', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), addLead);

// Update lead (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'put', '/:id', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), updateLead);

// Delete lead (Accessible by Superadmin and Subadmin)
safeRouterUse(router, 'delete', '/:id', authMiddleware, roleMiddleware(['superadmin', 'subadmin']), deleteLead);

// Get leads assigned to current user (Accessible by Agent)
safeRouterUse(router, 'get', '/mine', authMiddleware, roleMiddleware(['agent']), getMyLeads);

module.exports = router;