const pool = require("../config/db");
const { emitInApp, sendPushToUsers } = require("../services/notificatonService");

// Save Expo Push Token
exports.registerPushToken = async (req, res) => {
  try {
    const { userId, expoPushToken } = req.body;
    if (!userId || !expoPushToken) {
      return res.status(400).json({ error: "userId and expoPushToken required" });
    }

    await pool.query(
      `INSERT INTO device_push_tokens (user_id, expo_push_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE last_seen_at = CURRENT_TIMESTAMP`,
      [userId, expoPushToken]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("registerPushToken error:", err);
    res.status(500).json({ error: "Failed to save token" });
  }
};
// GET /api/notifications - authenticated: list notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, type, title, body, payload, is_read, created_at FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [[{ unread = 0 }]] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({ notifications: rows, unread });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/notifications/mark-read
exports.markRead = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });

    await pool.query(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// POST /api/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    await pool.query(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`, [userId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// Order placed → notify vendors + admins
exports.notifyOrderPlaced = async (req, res) => {
  const { orderId, vendorIds = [], adminIds = [] } = req.body;
  try {
    const title = "New Order Placed";
    const body = `Order #${orderId} has been placed.`;
    const data = { type: "order_placed", orderId };

    emitInApp(req.io, vendorIds, "order:placed", data);
    emitInApp(req.io, adminIds, "order:placed", data);

    await sendPushToUsers([...vendorIds, ...adminIds], title, body, data);

    res.json({ ok: true });
  } catch (err) {
    console.error("notifyOrderPlaced error:", err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
};

// Order delivered → notify user
exports.notifyOrderDelivered = async (req, res) => {
  const { orderId, userId, status = "delivered" } = req.body;
  try {
    const title = "Order Delivered";
    const body = `Your order #${orderId} is ${status}.`;
    const data = { type: "order_status", orderId, status };

    emitInApp(req.io, userId, "order:statusUpdated", data);
    await sendPushToUsers(userId, title, body, data);

    res.json({ ok: true });
  } catch (err) {
    console.error("notifyOrderDelivered error:", err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
};
