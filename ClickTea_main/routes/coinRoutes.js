const express = require("express");
const router = express.Router();
const { payWithCoins ,getCoinBalance} = require("../controllers/coinController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🪙 Pay using coins
router.post("/pay", verifyToken, authorizeRoles("user"), payWithCoins);


// 🪙 Get available coins
router.get("/balance", verifyToken, authorizeRoles("user"), getCoinBalance);

module.exports = router;
