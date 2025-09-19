// const express = require("express");
// const router = express.Router();
// const {
//   addToCart,
//   getUserCartByShop,
//   updateCartItem,
//   saveForLater,
//   clearCart,
//   deleteCartItem
// } = require("../controllers/cartController");

// const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// // ✅ Add to cart
// router.post("/add", verifyToken, authorizeRoles("user"), addToCart);

// // ✅ Get user cart
// router.get("/:shopId", verifyToken, authorizeRoles("user"), getUserCartByShop);

// // ✅ Update cart item (qty, addons, notes)
// router.put("/update/:cartId", verifyToken, authorizeRoles("user"), updateCartItem);

// // ✅ Save for later
// router.put("/save-later/:cartId", verifyToken, authorizeRoles("user"), saveForLater);

// // ✅ Clear cart
// router.delete("/clear", verifyToken, authorizeRoles("user"), clearCart);
// router.delete("/:cartId", verifyToken, authorizeRoles("user"), deleteCartItem);
// module.exports = router;
// routes/cart.js
const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCartAll,     // <- new
  getUserCartByShop,
  updateCartItem,
  saveForLater,
  clearCart,
  deleteCartItem
} = require("../controllers/cartController");

const { payCartWithCoins } = require("../controllers/coinController"); // optional: atomic pay-all
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Add to cart
router.post("/add", verifyToken, authorizeRoles("user"), addToCart);

// ✅ Get full user cart grouped by shop
router.get("/", verifyToken, authorizeRoles("user"), getUserCartAll);

// ✅ Get user cart for a single shop
router.get("/:shopId", verifyToken, authorizeRoles("user"), getUserCartByShop);

// ✅ Update cart item (qty, addons, notes)
router.put("/update/:cartId", verifyToken, authorizeRoles("user"), updateCartItem);

// ✅ Save for later
router.put("/save-later/:cartId", verifyToken, authorizeRoles("user"), saveForLater);

// ✅ Clear cart (optionally accept query ?shopId=123)
router.delete("/clear", verifyToken, authorizeRoles("user"), clearCart);

// ✅ Delete single cart item
router.delete("/:cartId", verifyToken, authorizeRoles("user"), deleteCartItem);

// ✅ (optional) Pay entire cart using coins atomically (server will create per-shop orders and deduct coins)
router.post("/pay-all-coins", verifyToken, authorizeRoles("user"), payCartWithCoins);

module.exports = router;
