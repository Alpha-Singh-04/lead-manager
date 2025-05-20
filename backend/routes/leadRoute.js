const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const { addLead } = require('../controllers/leadController');
const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(["super-admin", "sub-admin"]), addLead);


module.exports = router;