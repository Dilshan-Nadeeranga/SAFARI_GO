const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authenticate token middleware
const auth = async (req, res, next) => {
  try {
    // Added better debugging
    console.log("Auth middleware called");
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log("User not found with id:", decoded.id);
        return res.status(404).json({ message: 'User not found' });
      }

      // Fix: Ensure we convert ObjectId to string
      req.token = token;
      req.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email
      };
      
      console.log("Auth successful for user:", req.user.email, "with role:", req.user.role);
      next();
    } catch (jwtError) {
      console.log("JWT verification error:", jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', expired: true });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Authorize roles middleware - with better error messages
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed: User role '${req.user.role}' not in allowed roles: [${roles.join(', ')}]`);
      return res.status(403).json({ 
        message: `Access denied. Role '${req.user.role}' is not authorized.`,
        requiredRoles: roles
      });
    }
    next();
  };
};

// Additional utility middleware
const checkPermission = (resource, action) => {
  const permissionMap = {
    // Define resource-action permissions for different roles
    user: {
      bookings: ['create', 'read', 'update', 'delete'],
      profile: ['read', 'update', 'delete']
    },
    guide: {
      tours: ['create', 'read', 'update', 'delete'],
      profile: ['read', 'update', 'delete']
    },
    vehicle_owner: {
      vehicles: ['create', 'read', 'update', 'delete'],
      profile: ['read', 'update', 'delete']
    },
    admin: {
      users: ['create', 'read', 'update', 'delete'],
      bookings: ['read', 'update', 'delete'],
      tours: ['read', 'update', 'delete'],
      vehicles: ['read', 'update', 'delete'],
      notifications: ['read', 'delete'],
      system: ['configure']
    }
  };

  return (req, res, next) => {
    const role = req.user.role;
    
    // Admins have universal access
    if (role === 'admin') {
      return next();
    }
    
    // Check if role has permissions for the resource and action
    if (
      permissionMap[role] && 
      permissionMap[role][resource] &&
      permissionMap[role][resource].includes(action)
    ) {
      return next();
    }
    
    return res.status(403).json({ 
      message: `Access denied. Role '${role}' cannot ${action} ${resource}.`
    });
  };
};

// Authentication for feedback routes
const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Authentication failed: Invalid token' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

// Authorize admin middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// Export all middleware functions
module.exports = {
  auth,
  authorize,
  checkPermission,
  authenticateToken,
  authorizeAdmin
};