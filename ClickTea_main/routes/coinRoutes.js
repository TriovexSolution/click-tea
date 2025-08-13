const express = require("express");
const router = express.Router();
const { payWithCoins } = require("../controllers/coinController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🪙 Pay using coins
router.post("/pay", verifyToken, authorizeRoles("user"), payWithCoins);

module.exports = router;
