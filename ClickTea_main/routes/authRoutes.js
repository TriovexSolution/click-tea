// // routes/authRoutes.js

// const express = require("express");
// const router = express.Router();
// const { signup, signIn,requestOtp,resetPassword,changePassword } = require("../controllers/authController");
// const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// // Signup route
// router.post("/signup", signup);

// // Signin route
// router.post("/signin", signIn);
// router.post("/request-otp", requestOtp);   // forgot password
// router.post("/reset-password", resetPassword); // forgot password reset
// // Protected route: Only logged-in users can change password
// router.post(
//   "/change-password",
//   verifyToken,
//   authorizeRoles("user", "shop_owner", "admin"), // roles allowed
//   changePassword
// );

// module.exports = router;
// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {
  signup,
  signIn,
  requestOtp,
  resetPassword,
  changePassword,
  refresh,
  signOut,
} = require("../controllers/authController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/signin", signIn);
router.post("/request-otp", requestOtp);
router.post("/reset-password", resetPassword);

// Refresh token endpoint (public): accepts { refreshToken }
router.post("/refresh", refresh);

// Sign-out endpoint:
// - if client provides { refreshToken } in body -> revoke specific token
// - if request is authenticated (Authorization header) -> revoke all tokens for that user
// We allow both forms in the controller. If you prefer to require auth for signout-all, call verifyToken above.
router.post("/signout", signOut);

// Protected routes (example)
router.post(
  "/change-password",
  verifyToken,
  authorizeRoles("user", "shop_owner", "admin"),
  changePassword
);

module.exports = router;
