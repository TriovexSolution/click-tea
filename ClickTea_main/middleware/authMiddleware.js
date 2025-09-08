// // middleware/authMiddleware.js

// const jwt = require("jsonwebtoken");

// // Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: Token missing" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, role }
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// // Middleware to check allowed roles
// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ message: "Forbidden: Access denied" });
//     }
//     next();
//   };
// };

// module.exports = {
//   verifyToken,
//   authorizeRoles,
// };
// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Use ACCESS_TOKEN_SECRET if set, otherwise fallback to JWT_SECRET for backward compat
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

/**
 * verifyToken
 * - reads Authorization header "Bearer <token>"
 * - verifies using ACCESS_SECRET
 * - normalizes req.user to { userId, role, shopId }
 */
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: Token missing" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, ACCESS_SECRET);
//     // normalized user object (matches payload created in signIn/createAccessToken)
//     req.user = {
//       userId: decoded.userId ?? decoded.id ?? null,
//       role: decoded.role ?? null,
//       shopId: decoded.shopId ?? null,
//     };
//     next();
//   } catch (error) {
//     console.error("verifyToken error:", error);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  // console.log("verifyToken - Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    console.log("verifyToken - decoded payload:", decoded);
    req.user = {
      userId: decoded.userId ?? decoded.id ?? null,
      role: decoded.role ?? null,
      shopId: decoded.shopId ?? null,
    };
    next();
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * authorizeRoles(...allowedRoles)
 * - checks req.user.role (set by verifyToken)
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user info" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
