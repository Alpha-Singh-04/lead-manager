const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();


const authMiddleware = (req, res, next) => {
  console.log('Debug: Entering authMiddleware for', req.method, req.path);
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log('Debug: No token provided');
    return res.status(401).json({ 
      msg: "No token provided" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ 
      msg: "Token is invalid or expired" 
    });
  }
}

const roleMiddleware = (roles) => (req, res, next) => {
  console.log('Debug: Entering roleMiddleware for', req.method, req.path, 'with required roles:', roles, 'and user role:', req.user?.role);
  if (!req.user) {
    console.log('Debug: No user object in req');
    return res.status(401).json({ 
      msg: "Unauthorized" 
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      msg: "Forbidden" 
    });
  }

  next();
}

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

module.exports = {
  authMiddleware,
  roleMiddleware,
  hashPassword
}