// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { signup, signIn } = require("../controllers/authController");

// Signup route
router.post("/signup", signup);

// Signin route
router.post("/signin", signIn);

module.exports = router;
