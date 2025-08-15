const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is Super Admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is Sub Admin
const requireSubAdmin = (req, res, next) => {
  if (req.user.role !== 'sub_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Sub Admin access required' 
    });
  }
  next();
};

// Middleware to check if user is either Super Admin or Sub Admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'sub_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Hash password utility
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password utility
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireSubAdmin,
  requireAdmin,
  hashPassword,
  comparePassword,
  generateToken,
  JWT_SECRET
};
