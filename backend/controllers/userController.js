
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createUser = async(req, res) => {
  try{
    const { email, password, role } = req.body;

    // Validate role
    if (!email || !password || !["subadmin", "agent"].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid input data." 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: "User already exists." 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: `${role} created successfully.` });
  }catch(error){
    console.log(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}

module.exports = {
  createUser,
}