// // // middleware/authMiddleware.js

// // const jwt = require("jsonwebtoken");

// // // Middleware to verify JWT token
// // const verifyToken = (req, res, next) => {
// //   const authHeader = req.headers.authorization;

// //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //     return res.status(401).json({ message: "Unauthorized: Token missing" });
// //   }

// //   const token = authHeader.split(" ")[1];

// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     req.user = decoded; // { id, role }
// //     next();
// //   } catch (error) {
// //     return res.status(401).json({ message: "Invalid or expired token" });
// //   }
// // };

// // // Middleware to check allowed roles
// // const authorizeRoles = (...allowedRoles) => {
// //   return (req, res, next) => {
// //     if (!allowedRoles.includes(req.user.role)) {
// //       return res.status(403).json({ message: "Forbidden: Access denied" });
// //     }
// //     next();
// //   };
// // };

// // module.exports = {
// //   verifyToken,
// //   authorizeRoles,
// // };
// // middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");

// // Use ACCESS_TOKEN_SECRET if set, otherwise fallback to JWT_SECRET for backward compat
// const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

// /**
//  * verifyToken
//  * - reads Authorization header "Bearer <token>"
//  * - verifies using ACCESS_SECRET
//  * - normalizes req.user to { userId, role, shopId }
//  */
// // const verifyToken = (req, res, next) => {
// //   const authHeader = req.headers.authorization || req.headers.Authorization;

// //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //     return res.status(401).json({ message: "Unauthorized: Token missing" });
// //   }

// //   const token = authHeader.split(" ")[1];

// //   try {
// //     const decoded = jwt.verify(token, ACCESS_SECRET);
// //     // normalized user object (matches payload created in signIn/createAccessToken)
// //     req.user = {
// //       userId: decoded.userId ?? decoded.id ?? null,
// //       role: decoded.role ?? null,
// //       shopId: decoded.shopId ?? null,
// //     };
// //     next();
// //   } catch (error) {
// //     console.error("verifyToken error:", error);
// //     return res.status(401).json({ message: "Invalid or expired token" });
// //   }
// // };
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization;
//   // console.log("verifyToken - Authorization header:", authHeader);

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: Token missing" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, ACCESS_SECRET);
//     console.log("verifyToken - decoded payload:", decoded);
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

// /**
//  * authorizeRoles(...allowedRoles)
//  * - checks req.user.role (set by verifyToken)
//  */
// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized: No user info" });
//     }
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
// const jwt = require("jsonwebtoken");

// // Use ACCESS_TOKEN_SECRET if set, otherwise fallback to JWT_SECRET for backward compat
// const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

// /**
//  * verifyToken
//  * - reads Authorization header "Bearer <token>"
//  * - verifies using ACCESS_SECRET
//  * - normalizes req.user to { userId, role, shopId }
//  */
// // const verifyToken = (req, res, next) => {
// //   const authHeader = req.headers.authorization || req.headers.Authorization;

// //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //     return res.status(401).json({ message: "Unauthorized: Token missing" });
// //   }

// //   const token = authHeader.split(" ")[1];

// //   try {
// //     const decoded = jwt.verify(token, ACCESS_SECRET);
// //     // normalized user object (matches payload created in signIn/createAccessToken)
// //     req.user = {
// //       userId: decoded.userId ?? decoded.id ?? null,
// //       role: decoded.role ?? null,
// //       shopId: decoded.shopId ?? null,
// //     };
// //     next();
// //   } catch (error) {
// //     console.error("verifyToken error:", error);
// //     return res.status(401).json({ message: "Invalid or expired token" });
// //   }
// // };
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization || req.headers.Authorization;
//   // console.log("verifyToken - Authorization header:", authHeader);

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Unauthorized: Token missing" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, ACCESS_SECRET);
//     console.log("verifyToken - decoded payload:", decoded);
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

// /**
//  * authorizeRoles(...allowedRoles)
//  * - checks req.user.role (set by verifyToken)
//  */
// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized: No user info" });
//     }
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
// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Use ACCESS_TOKEN_SECRET if set, otherwise fallback to JWT_SECRET for backward compat
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;

/**
 * verifyToken
 * - verifies an access token (Bearer ...)
 * - normalizes req.user: { userId, id, role, shopId }
 * - if token lacks shopId, does a single DB lookup to populate it
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token signature and expiry
    const decoded = jwt.verify(token, ACCESS_SECRET);
    // Helpful debug — remove or guard behind NODE_ENV !== 'production' if noisy
    console.log("verifyToken - decoded payload:", decoded);

    const userId = decoded.userId ?? decoded.id ?? null;
    const role = decoded.role ?? null;
    let shopId = decoded.shopId ?? null;

    // Defensive DB lookup only when token lacks shopId
    if (!shopId && userId) {
      try {
        // adjust column if your shops table uses different owner column name
        const [rows] = await db.query("SELECT id FROM shops WHERE owner_id = ? LIMIT 1", [userId]);
        if (rows && rows.length) {
          shopId = rows[0].id;
          console.log("verifyToken: populated shopId from DB:", shopId);
        }
      } catch (e) {
        // non-fatal, continue — handlers will return 403 when shopId required
        console.warn("verifyToken: DB lookup for shopId failed", e);
      }
    }

    // normalize both userId and id to avoid controller mismatch
    req.user = {
      userId,
      id: userId,
      role,
      shopId,
    };

    return next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * authorizeRoles(...)
 * simple middleware factory to restrict by role(s)
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
