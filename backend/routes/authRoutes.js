const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

function safeRouterUse(router, method, path, ...handlers) {
  if (typeof path !== 'string' || path.trim() === '' || /^:/.test(path) || /:\s*$/.test(path)) {
    throw new Error(`Malformed router path detected: '${path}'`);
  }
  console.log(`Registering router path [${method.toUpperCase()}]:`, path);
  router[method](path, ...handlers);
}

// Login route
safeRouterUse(router, 'post', '/login', login);
// safeRouterUse(router, 'post', '/register', register);

module.exports = router;