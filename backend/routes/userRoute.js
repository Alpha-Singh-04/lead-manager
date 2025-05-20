const express = require("express");
const { createUser } = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to create a new user
router.post("/", authMiddleware, roleMiddleware(["superadmin"]), createUser);

module.exports = router;