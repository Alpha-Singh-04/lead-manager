const bcrypt = require("bcrypt");
const User = require("../models/User");

const createUser = async(req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !["subadmin", "agent"].includes(role)) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, email, password, and role (subadmin or agent)" 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: "User with this email already exists." 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save middleware
      role
    });

    // Save user
    await newUser.save();

    res.status(201).json({ 
      message: `${role} created successfully.`,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error creating user. Please try again."
    });
  }
}

const getAllUsers = async (req, res) => {
  try{
    const users = await User.find({ 
      role: { $ne: 'superadmin' } 
    }).select('-password');
    res.status(200).json(users);
  }catch(error){
    res.status(500).json({ 
      message: 'Server error', error: error.message
    });
  }
}

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { email, role }, { new: true });
    res.status(200).json({ 
      message: 'User updated', user 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Update failed', error: err.message 
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ 
      message: 'User deleted' 
    });
  } catch (err) {
    res.status(500).json({
      message: 'Deletion failed', error: err.message 
    });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser
}