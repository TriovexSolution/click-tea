const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationContoller");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
router.post("/register-push-token", notificationController.registerPushToken);

// protected: fetch & mark notifications
router.get("/", verifyToken, notificationController.getNotifications);
router.post("/mark-read", verifyToken, notificationController.markRead);
router.post("/mark-all-read", verifyToken, notificationController.markAllRead);

router.post("/notify/order-placed", notificationController.notifyOrderPlaced);
router.post("/notify/order-delivered", notificationController.notifyOrderDelivered);

module.exports = router;
