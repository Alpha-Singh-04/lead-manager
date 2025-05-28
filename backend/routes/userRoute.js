const express = require("express");
const { createUser, getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

function safeRouterUse(router, method, path, ...handlers) {
  if (typeof path !== 'string' || path.trim() === '' || /^:/.test(path) || /:\s*$/.test(path)) {
    throw new Error(`Malformed router path detected: '${path}'`);
  }
  console.log(`Registering router path [${method.toUpperCase()}]:`, path);
  router[method](path, ...handlers);
}

// Route to create a new user
safeRouterUse(router, 'post', '/', authMiddleware, roleMiddleware(["superadmin"]), createUser);

// Route to get all users
safeRouterUse(router, 'get', '/all', authMiddleware, roleMiddleware(["superadmin"]), getAllUsers);

// Route to update a user
safeRouterUse(router, 'put', '/:id', authMiddleware, roleMiddleware(["superadmin"]), updateUser);

// Route to delete a user
safeRouterUse(router, 'delete', '/:id', authMiddleware, roleMiddleware(["superadmin"]), deleteUser);

module.exports = router;