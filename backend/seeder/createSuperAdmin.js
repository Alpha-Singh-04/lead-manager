const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config({ path: __dirname + '/../.env' });

console.log("Mongodb URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const existing = await User.findOne({ email: "admin@example.com" });
  if (existing) {
    console.log("Super Admin already exists");
    process.exit(0);
  }

  // const hashedPassword = await bcrypt.hash("admin123", 10);

  const newUser = new User({
    name: "Super Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "superadmin",
  });

  await newUser.save();
  console.log("✅ Super Admin created successfully");
  process.exit(0);
}).catch((err) => {
  console.error("Error connecting to DB", err);
  process.exit(1);
});
