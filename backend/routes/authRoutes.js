const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// Login route
router.post('/login', login);
// router.post('/register', register);

module.exports = router;