

// const jwt = require('jsonwebtoken');

// exports.authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;  // Attach user details (id, email, role) to `req.user`
//     console.log("Authenticated User:", req.user);
//     next();
//   } catch (error) {
//     return res.status(403).json({ message: 'Invalid Token' });
//   }
// };

// exports.authorizeRole = (requiredRole) => {
//   return (req, res, next) => {
//     if (!req.user || req.user.role !== requiredRole) {
//       return res.status(403).json({ message: 'Access Denied. Unauthorized Role.' });
//     }
//     console.log(`Access granted to ${req.user.role} for ${req.originalUrl}`);
//     next();
//   };
// };




const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            access: user.access, // ✅ Includes access in the token
            permissions: user.permissions, // ✅ Keeps permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Token expiration
    );
};

exports.authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No Token Provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ Now includes `access` directly from the JWT
        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid Token" });
    }
};

exports.authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ message: "Access Denied. Unauthorized Role." });
        }
        console.log(`Access granted to ${req.user.role} for ${req.originalUrl}`);
        next();
    };
};
