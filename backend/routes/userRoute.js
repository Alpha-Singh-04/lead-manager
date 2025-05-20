const express = require("express");
const { createUser, getAllUsers, updateUser, deleteUser } = require("../controllers/userController");
const { authMiddleware, roleMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to create a new user
router.post("/", authMiddleware, roleMiddleware(["superadmin"]), createUser);

// Route to get all users
router.get("/all", authMiddleware, roleMiddleware(["superadmin"]), getAllUsers);

// Route to update a user
router.put("/:id", authMiddleware, roleMiddleware(["superadmin"]), updateUser);

// Route to delete a user
router.delete("/:id", authMiddleware, roleMiddleware(["superadmin"]), deleteUser);


module.exports = router;