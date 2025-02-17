

const jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Attach user details (id, email, role) to `req.user`
    console.log("Authenticated User:", req.user);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};

exports.authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ message: 'Access Denied. Unauthorized Role.' });
    }
    console.log(`Access granted to ${req.user.role} for ${req.originalUrl}`);
    next();
  };
};





// const jwt = require('jsonwebtoken');

// // Middleware to authenticate JWT token
// exports.authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user details (id, email, role, access) to `req.user`
//     console.log("Authenticated User:", req.user);
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: 'Invalid Token' });
//   }
// };

// // Middleware to authorize based on role and access
// exports.authorizeRoleAndAccess = (requiredRole, requiredAccess) => {
//   return (req, res, next) => {
//     const { role, access } = req.user; // Extract role and access from JWT

//     if (!role || !access) {
//       return res.status(403).json({ message: 'Access Denied. Unauthorized User.' });
//     }

//     if (role !== requiredRole || access !== requiredAccess) {
//       return res.status(403).json({ message: 'Access Denied. Unauthorized Role or Insufficient Access.' });
//     }

//     console.log(`✅ Access granted to ${role} for ${req.originalUrl}`);
//     next();
//   };
// };
