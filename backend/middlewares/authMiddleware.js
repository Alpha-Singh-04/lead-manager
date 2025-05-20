const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();


const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ 
    msg: "No token provided" 
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ 
      msg: "Token is invalid or expired" 
    });
  }
}

const roleMiddleware = (roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ 
    msg: "Unauthorized" 
  });

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      msg: "Forbidden" 
    });
  }

  next();
}

module.exports = {
  authMiddleware,
  roleMiddleware
}