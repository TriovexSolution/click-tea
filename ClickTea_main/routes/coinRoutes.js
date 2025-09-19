// const express = require("express");
// const router = express.Router();
// const { payWithCoins ,getCoinBalance,getCoinHistory} = require("../controllers/coinController");
// const { verifyToken, authorizeRoles ,} = require("../middleware/authMiddleware");

// // 🪙 Pay using coins
// router.post("/pay", verifyToken, authorizeRoles("user"), payWithCoins);


// // 🪙 Get available coins
// router.get("/balance", verifyToken, authorizeRoles("user"), getCoinBalance);
// // 🪙 Get transaction history
// router.get("/history", verifyToken, authorizeRoles("user"), getCoinHistory);

// module.exports = router;

// routes/coin.js
const express = require("express");
const router = express.Router();
const { payWithCoins, payCartWithCoins, getCoinBalance, getCoinHistory } = require("../controllers/coinController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// 🪙 Pay using coins (single shop) - existing
router.post("/pay", verifyToken, authorizeRoles("user"), payWithCoins);

// 🪙 Pay the entire cart using coins (atomic across shops) - new/optional
router.post("/pay-all", verifyToken, authorizeRoles("user"), payCartWithCoins);

// 🪙 Get available coins
router.get("/balance", verifyToken, authorizeRoles("user"), getCoinBalance);

// 🪙 Get transaction history
router.get("/history", verifyToken, authorizeRoles("user"), getCoinHistory);

module.exports = router;
