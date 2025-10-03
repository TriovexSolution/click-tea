// // const express = require("express");
// // const router = express.Router();

// // const {
// //   placeOrder,
// //   getMyOrders,
// //   getShopOrders,
// //   getAllOrders,
// //   getOrderById,
// //   cancelOrder,
// //   updateOrderStatus,
// //   placePayLaterOrder,
// //   getPopularItems
// // } = require("../controllers/orderController");

// // const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// // // ✅ User: Place an order
// // router.post("/place", verifyToken, authorizeRoles("user"), placeOrder);

// // // ✅ User: View own orders
// // router.get("/my-orders", verifyToken, authorizeRoles("user"), getMyOrders);
// // // GET single order (user/shop_owner/admin)

// // // ✅ Shop Owner: View orders for their shop
// // router.get("/shop-orders", verifyToken, authorizeRoles("shop_owner"), getShopOrders);

// // // ✅ Admin: View all orders
// // router.get("/all", verifyToken, authorizeRoles("admin"), getAllOrders);

// // // ✅ Cancel order (user, shop_owner, admin)
// // router.put("/cancel/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), cancelOrder);

// // // ✅ Shop Owner: Update order status
// // router.put(
// //   "/status/:orderId",
// //   verifyToken,
// //   authorizeRoles("shop_owner", "admin"),
// //   updateOrderStatus
// // );
// // // POST /orders/pay-later
// // router.post("/pay-later", verifyToken,authorizeRoles("user"), placePayLaterOrder);
// // router.get("/popular-items",verifyToken,authorizeRoles("user"), getPopularItems);
// // router.get("/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), getOrderById);

// // module.exports = router;

// // routes/order.js
// const express = require("express");
// const router = express.Router();

// const {
//   placeOrder,
//   createOrdersFromCart, // <- new
//   getMyOrders,
//   getShopOrders,
//   getAllOrders,
//   getOrderById,
//   cancelOrder,
//   updateOrderStatus,
//   placePayLaterOrder,
//   getPopularItems,
//   getMyPayLater
// } = require("../controllers/orderController");

// const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// // ✅ User: Place an order (single shop)
// router.post("/place", verifyToken, authorizeRoles("user"), placeOrder);

// // ✅ Create orders from full cart (auto-splits per shop)
// router.post("/create-from-cart", verifyToken, authorizeRoles("user"), createOrdersFromCart);

// // ✅ User: View own orders
// router.get("/my-orders", verifyToken, authorizeRoles("user"), getMyOrders);

// // ✅ Shop Owner: View orders for their shop
// router.get("/shop-orders", verifyToken, authorizeRoles("shop_owner"), getShopOrders);

// // ✅ Admin: View all orders
// router.get("/all", verifyToken, authorizeRoles("admin"), getAllOrders);

// // ✅ Cancel order (user, shop_owner, admin)
// router.put("/cancel/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), cancelOrder);

// // ✅ Shop Owner: Update order status
// router.put("/status/:orderId", verifyToken, authorizeRoles("shop_owner", "admin"), updateOrderStatus);

// // POST /orders/pay-later
// router.post("/pay-later", verifyToken, authorizeRoles("user"), placePayLaterOrder);

// // GET popular items
// router.get("/popular-items", verifyToken, authorizeRoles("user"), getPopularItems);

// // GET single order
// router.get("/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), getOrderById);

// // GET /orders/my-pay-later
// router.get(
//   "/my-pay-later",
//   verifyToken,
//   authorizeRoles("user"),
//   getMyPayLater
// );
// module.exports = router;
const express = require("express");
const router = express.Router();

const {
  placeOrder,
  createOrdersFromCart,
  getMyOrders,
  getShopOrders,
  getAllOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  placePayLaterOrder,
  getPopularItems,
  getMyPayLater,
  getSinglePayLater
} = require("../controllers/orderController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Specific/static routes first
router.post("/place", verifyToken, authorizeRoles("user"), placeOrder);
router.post("/create-from-cart", verifyToken, authorizeRoles("user"), createOrdersFromCart);
router.get("/my-orders", verifyToken, authorizeRoles("user"), getMyOrders);
router.get("/shop-orders", verifyToken, authorizeRoles("shop_owner"), getShopOrders);
router.get("/all", verifyToken, authorizeRoles("admin"), getAllOrders);

router.post("/pay-later", verifyToken, authorizeRoles("user"), placePayLaterOrder);

// put popular-items and pay-later endpoints BEFORE the param route:
router.get("/popular-items", verifyToken, authorizeRoles("user"), getPopularItems);

// your new single-shop pay later route (more specific) - ensure this exists and is declared before param route
router.get("/my-pay-later/:payLaterId/shop/:shopId", verifyToken, authorizeRoles("user"), getSinglePayLater);

// list pay-later
router.get("/my-pay-later", verifyToken, authorizeRoles("user"), getMyPayLater);

// cancel and status
router.put("/cancel/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), cancelOrder);
router.put("/status/:orderId", verifyToken, authorizeRoles("shop_owner", "admin"), updateOrderStatus);

// --- Finally, the param route(s) ---
router.get("/:orderId", verifyToken, authorizeRoles("user", "shop_owner", "admin"), getOrderById);

module.exports = router;
