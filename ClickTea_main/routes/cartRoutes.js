const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCartByShop,
  updateCartItem,
  saveForLater,
  clearCart,
  deleteCartItem
} = require("../controllers/cartController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Add to cart
router.post("/add", verifyToken, authorizeRoles("user"), addToCart);

// ✅ Get user cart
router.get("/:shopId", verifyToken, authorizeRoles("user"), getUserCartByShop);

// ✅ Update cart item (qty, addons, notes)
router.put("/update/:cartId", verifyToken, authorizeRoles("user"), updateCartItem);

// ✅ Save for later
router.put("/save-later/:cartId", verifyToken, authorizeRoles("user"), saveForLater);

// ✅ Clear cart
router.delete("/clear", verifyToken, authorizeRoles("user"), clearCart);
router.delete("/:cartId", verifyToken, authorizeRoles("user"), deleteCartItem);
module.exports = router;
