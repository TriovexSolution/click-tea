const express = require("express");
const router = express.Router();
const { getUserProfile ,updateUserProfile} = require("../controllers/userController");
const {verifyToken} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
router.get("/", verifyToken, getUserProfile);
// ✅ Update profile (with optional image upload)
router.put("/edit", verifyToken, upload.single("userImage"), updateUserProfile);
module.exports = router;
