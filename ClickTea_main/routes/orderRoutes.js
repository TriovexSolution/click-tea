const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getShopOrders,
  getAllOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  placePayLaterOrder,
  getPopularItems
} = require("../controllers/orderController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ User: Place an order
router.post("/place", verifyToken, authorizeRoles("user"), placeOrder);

// ✅ User: View own orders
router.get("/my-orders", verifyToken, authorizeRoles("user"), getMyOrders);
// GET single order (user/shop_owner/admin)

// ✅ Shop Owner: View orders for their shop
router.get("/shop-orders", verifyToken, authorizeRoles("shop_owner"), getShopOrders);

// ✅ Admin: View all orders
router.get("/all", verifyToken, authorizeRoles("admin"), getAllOrders);

// ✅ Cancel order (user, shop_owner, admin)
router.put("/cancel/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), cancelOrder);

// ✅ Shop Owner: Update order status
router.put(
  "/status/:orderId",
  verifyToken,
  authorizeRoles("shop_owner", "admin"),
  updateOrderStatus
);
// POST /orders/pay-later
router.post("/pay-later", verifyToken,authorizeRoles("user"), placePayLaterOrder);
router.get("/popular-items",verifyToken,authorizeRoles("user"), getPopularItems);
router.get("/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), getOrderById);

module.exports = router;
