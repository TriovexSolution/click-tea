const { roundMoney } = require("../config/constant");
const db = require("../config/db");
const { sendPushToUsers, emitInApp, notifyUsers } = require("../services/notificatonService");
const { sanitizeCartItems, computeOrderTotals } = require("../utils/orderHelper");


const placeOrder = async (req, res) => {
  const userId = req.user?.userId;
  const { cartItems: rawCart, shopId, payment_type, delivery_note = "" } = req.body;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!shopId) return res.status(400).json({ message: "Missing shopId" });
  if (!Array.isArray(rawCart) || rawCart.length === 0) return res.status(400).json({ message: "Cart is empty" });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // sanitize and compute totals server-side
    const sanitized = sanitizeCartItems(rawCart);
    const { prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount } =
      await computeOrderTotals(conn, sanitized);

    // Optionally compare client-provided totalAmount for logging only
    if (req.body.totalAmount && roundMoney(req.body.totalAmount) !== roundMoney(totalAmount)) {
      console.warn(`Client/Server totalAmount mismatch for user ${userId}. Client: ${req.body.totalAmount}, Server: ${totalAmount}`);
      // but continue using server-computed totalAmount
    }

    // insert order (server-canonical totals)
    const [orderResult] = await conn.query(
      `INSERT INTO orders (userId, shopId, subtotal, gstAmount, deliveryFee, discount, totalAmount, payment_type, is_paid, delivery_note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, shopId, subtotal.toFixed(2), gstAmount.toFixed(2), deliveryFee.toFixed(2), discount.toFixed(2), totalAmount.toFixed(2), payment_type ?? "unknown", 1, delivery_note, 'preparing']
    );
    const orderId = orderResult.insertId;

    // insert order_items WITHOUT per-item gst
    for (const it of prepared) {
      await conn.query(
        `INSERT INTO order_items (orderId, menuId, menuName, variantId, quantity, addons, unitPrice, price, subtotal, snapshot, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          it.menuId,
          it.snapshotName,
          it.variantSnapshot ? it.variantSnapshot.variantId : null,
          it.quantity,
          JSON.stringify(it.addons || []),
          it.unitPrice.toFixed(2),
          it.unitPrice.toFixed(2), // price column (if you use both unitPrice & price)
          it.subtotal.toFixed(2),
          JSON.stringify({ menuName: it.snapshotName, variant: it.variantSnapshot, unitPrice: it.unitPrice, qty: it.quantity })
        ]
      );
    }

    // Clear cart for this user + shop
    await conn.query("DELETE FROM cart_items WHERE userId = ? AND shopId = ? AND status = 'active'", [userId, shopId]);

    await conn.commit();
    return res.status(201).json({ message: "Order placed successfully", orderId, total: totalAmount });
  } catch (err) {
    console.error("Place order error:", err);
    try { if (conn) await conn.rollback(); } catch (_) {}
    if (!res.headersSent) return res.status(500).json({ message: err.message || "Server error" });
  } finally {
    if (conn) try { await conn.release(); } catch (_) {}
  }
};
const createOrdersFromCart = async (req, res) => {
  const userId = req.user.userId;
  const { payment_type = 'unknown', delivery_note = '' } = req.body;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // fetch active cart
    const [cartRows] = await conn.query(
      `SELECT * FROM cart_items WHERE userId = ? AND status = 'active' ORDER BY shopId, cartId`,
      [userId]
    );
    if (!cartRows.length) {
      await conn.rollback();
      return res.status(400).json({ message: "Cart is empty" });
    }

    // group
    const grouped = cartRows.reduce((acc, r) => {
      const sid = Number(r.shopId);
      if (!acc[sid]) acc[sid] = [];
      acc[sid].push(r);
      return acc;
    }, {});

    const createdOrders = [];
    for (const shopIdStr of Object.keys(grouped)) {
      const shopId = Number(shopIdStr);
      const items = grouped[shopId];

      // compute subtotal etc from snapshotPrice and addons (adjust if you store addon prices differently)
      let subtotal = 0;
      const prepared = items.map((it) => {
        const qty = Number(it.quantity || 0);
        const unit = Number(it.snapshotPrice || 0);
        let addonsTotal = 0;
        let addons = [];
        try { addons = JSON.parse(it.addons || "[]"); } catch (e) { addons = []; }
        addons.forEach(a => { addonsTotal += Number(a.price || 0) * (Number(a.qty || 1)); });
        const lineSubtotal = (unit * qty) + addonsTotal;
        subtotal += lineSubtotal;
        return { cartId: it.cartId, menuId: it.menuId, variantId: it.variantId, qty, unit, addons, lineSubtotal, snapshotName: it.snapshotName };
      });

      // TODO: compute gstAmount, deliveryFee, discount by your rules or reuse computeOrderTotals util
      const gstAmount = 0;
      const deliveryFee = 0;
      const discount = 0;
      const totalAmount = subtotal + gstAmount + deliveryFee - discount;

      const [orderResult] = await conn.query(
        `INSERT INTO orders (userId, shopId, subtotal, gstAmount, deliveryFee, discount, totalAmount, payment_type, is_paid, status, delivery_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [userId, shopId, subtotal.toFixed(2), gstAmount.toFixed(2), deliveryFee.toFixed(2), discount.toFixed(2), totalAmount.toFixed(2), payment_type, 0, 'preparing', delivery_note]
      );
      const orderId = orderResult.insertId;

      // insert order_items
      for (const p of prepared) {
        await conn.query(
          `INSERT INTO order_items (orderId, menuId, variantId, quantity, addons, price, subtotal, menuName, unitPrice, snapshot, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            orderId,
            p.menuId,
            p.variantId || null,
            p.qty,
            JSON.stringify(p.addons || []),
            p.unit.toFixed(2),
            p.lineSubtotal.toFixed(2),
            p.snapshotName,
            p.unit.toFixed(2),
            JSON.stringify({ menuName: p.snapshotName, variant: p.variantId })
          ]
        );
      }

      // remove those cart items
      const cartIds = prepared.map((p) => p.cartId);
      if (cartIds.length) {
        await conn.query("DELETE FROM cart_items WHERE cartId IN (?)", [cartIds]);
      }

      createdOrders.push({ orderId, shopId, subtotal: Number(subtotal.toFixed(2)), totalAmount: Number(totalAmount.toFixed(2)), itemCount: prepared.length });
    }

    await conn.commit();
    return res.status(201).json({ message: "Orders created", createdOrders });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("createOrdersFromCart error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) try { await conn.release(); } catch(_) {}
  }
};
// ✅ 2. Get Orders for a User
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get user orders with shop info
    const [orders] = await db.query(
      `
      SELECT o.orderId, o.totalAmount, o.status, o.created_at, o.payment_type, s.shopname ,s.shopImage
      FROM orders o
      JOIN shops s ON o.shopId = s.id
      WHERE o.userId = ?
      ORDER BY o.created_at DESC
      `,
      [userId]
    );

    // 2. Attach items to each order
    const result = [];

    for (const order of orders) {
      const [items] = await db.query(
        `
        SELECT oi.menuId, oi.quantity, oi.subtotal, m.menuName, m.imageUrl 
        FROM order_items oi
        JOIN menus m ON oi.menuId = m.menuId
        WHERE oi.orderId = ?
        `,
        [order.orderId]
      );

      result.push({
        ...order,
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Get user orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ 3. Get Orders for Shop Owner
const getShopOrders = async (req, res) => {
  try {
    const shopId = req.user.shopId || req.query.shopId;
    if (!shopId) {
      return res.status(400).json({ message: "Missing shop ID" });
    }

    const statusFilter = req.query.status; // optional
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, u.username 
      FROM orders o
      JOIN users u ON o.userId = u.id
      WHERE o.shopId = ?
    `;

    const params = [shopId];

    if (statusFilter) {
      query += " AND o.status = ?";
      params.push(statusFilter);
    }

    query += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [orders] = await db.query(
      `
      SELECT o.*, u.username 
      FROM orders o
      JOIN users u ON o.userId = u.id
      WHERE o.shopId = ?
      ORDER BY o.created_at DESC
    `,
      [shopId]
    );

    const detailedOrders = [];

    for (let order of orders) {
      const [items] = await db.query(
        `
        SELECT 
          oi.*, 
          m.menuName, 
          m.imageUrl 
        FROM order_items oi
      JOIN menus m ON oi.menuId = m.menuId
        WHERE oi.orderId = ?
      `,
        [order.orderId]
      );
      // Parse addon string back to array
     const parsedItems = items.map((item) => ({
  ...item,
  addons:
    typeof item.addons === "string" && item.addons.trim().startsWith("[")
      ? JSON.parse(item.addons)
      : item.addons || [],
}));
      detailedOrders.push({
        orderId: order.orderId,
        username: order.username,
        totalAmount: order.totalAmount,
        payment_type: order.payment_type,
        status: order.status,
        delivery_note: order.delivery_note,
        created_at: order.created_at,
        items: parsedItems,
          quantity: parsedItems.reduce((sum, item) => sum + item.quantity, 0),
      });
    }

    res.status(200).json(detailedOrders);
  } catch (err) {
    console.error("❌ getShopOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Admin: Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY ordered_at DESC"
    );
    res.status(200).json(orders);
  } catch (err) {
    console.error("All orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// GET /api/orders/:orderId
const getOrderById = async (req, res) => {
    // console.log("DEBUG: hit /:orderId route", req.params.orderId);
  try {
    const orderId = req.params.orderId;
    const user = req.user; // from verifyToken middleware

    // 1) fetch order with shop & user info
    const [orders] = await db.query(
      `SELECT o.*, s.shopname, s.id AS shopId, u.username, u.id AS userId
       FROM orders o
       JOIN shops s ON o.shopId = s.id
       JOIN users u ON o.userId = u.id
       WHERE o.orderId = ?`,
      [orderId]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // 2) Authorization checks
    // - users can only access their own orders
    // - shop_owner can access orders of their shop
    // - admin can access all
    if (user.role === "user" && order.userId !== user.userId) {
      return res.status(403).json({ message: "You are not allowed to view this order" });
    }

    if (user.role === "shop_owner") {
      // ensure shop_owner is owner of the shop on the order
      const shopIdFromToken = user.shopId;
      if (!shopIdFromToken || Number(shopIdFromToken) !== Number(order.shopId)) {
        return res.status(403).json({ message: "You are not allowed to view this order" });
      }
    }

    // 3) Fetch items for the order (with menu details)
    const [items] = await db.query(
      `SELECT oi.*, m.menuName, m.imageUrl
       FROM order_items oi
       LEFT JOIN menus m ON oi.menuId = m.menuId
       WHERE oi.orderId = ?`,
      [orderId]
    );

    // Parse addons if stored as JSON string and compute quantities
    const parsedItems = items.map((it) => {
      let addons = it.addons;
      if (typeof addons === "string" && addons.trim().startsWith("[")) {
        try {
          addons = JSON.parse(addons);
        } catch (e) {
          addons = [];
        }
      } else if (!addons) {
        addons = [];
      }
      return {
        ...it,
        addons,
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
        subtotal: Number(it.subtotal) || 0,
      };
    });

    // 4) Compose totals & meta for client convenience
    const itemCount = parsedItems.reduce((s, it) => s + it.quantity, 0);
    // If your orders table stores discount/tax separately you can compute "originalAmount"
    // Here we attempt to read discount/original_amount, otherwise fallback:
    const totalAmount = Number(order.totalAmount) || 0;
    const discount = Number(order.discount || 0);
    const originalAmount = Number(order.originalAmount || totalAmount + discount);

    const response = {
      orderId: order.orderId,
      userId: order.userId,
      username: order.username,
      shopId: order.shopId,
      shopname: order.shopname,
      status: order.status,
      payment_type: order.payment_type,
      paymentMethod: order.payment_type, // use whichever field your front expects
      totalAmount,
      originalAmount,
      discount,
      delivery_note: order.delivery_note,
      created_at: order.created_at,
      items: parsedItems,
      itemCount,
      // any other helpful fields:
      is_paid: !!order.is_paid,
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const role = req.user.role;
    const userId = req.user.userId;

    // Get order
    const [orders] = await db.query("SELECT * FROM orders WHERE orderId = ?", [orderId]);
    if (!orders.length) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];

    // Authorization
    if (role === "user" && order.userId !== userId)
      return res.status(403).json({ message: "You can't cancel this order" });

    if (role === "shop_owner") {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [userId]);
      if (!shop.length || shop[0].id !== order.shopId)
        return res.status(403).json({ message: "You can't cancel this order" });
    }

    // Prevent double-cancel / double-refund
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled", refunded: false });
    }

    // Start transaction to update order + refund safely
    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Mark order cancelled
      await conn.query("UPDATE orders SET status = 'cancelled' WHERE orderId = ?", [orderId]);

      let refunded = false;
      let refundAmount = 0;
      let newCoinBalance = null;

      if (order.payment_type === "coin") {
        refundAmount = Number(order.totalAmount) || 0;

        // Refund coins to user
        await conn.query("UPDATE users SET coin = coin + ? WHERE id = ?", [refundAmount, order.userId]);

        // Add coin_history log
        await conn.query(
          `INSERT INTO coin_history (userId, orderId, type, amount, reason, created_at)
           VALUES (?, ?, 'credit', ?, 'Order Cancelled', NOW())`,
          [order.userId, orderId, refundAmount]
        );

        // read new balance
        const [[userRow]] = await conn.query("SELECT coin FROM users WHERE id = ?", [order.userId]);
        newCoinBalance = userRow ? Number(userRow.coin) : null;
        refunded = true;
      }

      await conn.commit();

      const message = refunded
        ? `Order cancelled. ₹${refundAmount.toFixed(2)} credited to your ClickTea Coins.`
        : "Order cancelled successfully.";

      return res.status(200).json({
        message,
        refunded,
        refundAmount,
        newCoinBalance,
      });
    } catch (innerErr) {
      if (conn) await conn.rollback();
      console.error("Cancel transaction error:", innerErr);
      return res.status(500).json({ message: "Server error during cancel" });
    } finally {
      if (conn) try { await conn.release(); } catch (_) {}
    }
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const role = req.user.role;
    const actorId = req.user.userId;

    if (!orderId || !status) return res.status(400).json({ message: "orderId and status required" });

    // Build query and params - restrict to shop owner if role=shop_owner
    let query = "SELECT * FROM orders WHERE orderId = ?";
    const params = [orderId];
    if (role === "shop_owner") {
      const shopId = req.user.shopId;
      if (!shopId) return res.status(403).json({ message: "No shop associated with your account" });
      query += " AND shopId = ?";
      params.push(shopId);
    }

    const [orderRows] = await db.query(query, params);
    if (!orderRows.length) return res.status(404).json({ message: "Order not found or unauthorized" });

    // Update the status
    await db.query("UPDATE orders SET status = ? WHERE orderId = ?", [status, orderId]);

    // Respond quickly
    res.status(200).json({ message: "Order status updated successfully" });

    // Async notify (do not block response)
    (async () => {
      try {
        const order = orderRows[0];
        // payload for sockets / push / DB
        const payload = {
          type: "order_status",
          orderId: Number(orderId),
          shopId: order.shopId,
          userId: order.userId,
          status,
          short: `Order #${orderId} is ${status}`,
          full: `Order #${orderId} is now ${status}`
        };

        // Notify the customer (order owner)
        await notifyUsers({
          io: req.io,
          userIds: [order.userId],
          event: "order:statusUpdated",
          type: "order_status",
          title: `Order #${orderId} ${status}`,
          body: payload.full,
          payload
        });

        // Optionally notify the shop owner (actor) with a record (so their notification list logs the change)
        // Find shop owner id
        try {
          const [[shopRow]] = await db.query("SELECT owner_id FROM shops WHERE id = ? LIMIT 1", [order.shopId]);
          const shopOwnerId = shopRow && shopRow.owner_id ? shopRow.owner_id : null;
          if (shopOwnerId) {
            await notifyUsers({
              io: req.io,
              userIds: [shopOwnerId],
              event: "order:statusUpdated",
              type: "order_status",
              title: `You updated Order #${orderId}`,
              body: `Order #${orderId} status set to ${status}`,
              payload: { ...payload, actorId }
            });
          }
        } catch (innerErr) {
          console.warn("Failed to notify shop owner", innerErr);
        }
      } catch (err) {
        console.warn("Async notify error:", err);
      }
    })();
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ New: Place Order with Pay Later

const round2 = (v) => Number(Number(v).toFixed(2));

const placePayLaterOrder = async (req, res) => {
  const userId = req.user?.userId;
  const { cartItems, delivery_note = "" } = req.body;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!Array.isArray(cartItems) || cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) Check active subscription
    const [subs] = await conn.query(
      `SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    if (!subs.length) {
      await conn.rollback();
      return res.status(403).json({ message: "No active subscription" });
    }

    // 2) Validate & group items by shopId
    const shopMap = {};
    const cartIds = [];   // collect cartId if provided by client
    const shopIdSet = new Set();
    for (const item of cartItems) {
      if (!item || (item.shopId === undefined || item.shopId === null)) {
        await conn.rollback();
        return res.status(400).json({ message: "Missing shopId in cart item", item });
      }
      const sid = Number(item.shopId);
      if (!Number.isFinite(sid) || sid <= 0) {
        await conn.rollback();
        return res.status(400).json({ message: "Invalid shopId in cart item", item });
      }
      shopMap[sid] = shopMap[sid] || [];
      shopMap[sid].push(item);

      shopIdSet.add(sid);
      if (item.cartId) cartIds.push(Number(item.cartId));
    }

    // 3) For each shop compute canonical totals using server logic
    const shopSummaries = []; // { shopId, prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount }
    let grandTotal = 0;
    for (const shopIdStr of Object.keys(shopMap)) {
      const shopId = Number(shopIdStr);
      const sanitized = sanitizeCartItems(shopMap[shopId]);
      const totals = await computeOrderTotals(conn, sanitized, shopId);
      if (!totals || !Array.isArray(totals.prepared)) {
        throw new Error("computeOrderTotals returned invalid result");
      }
      shopSummaries.push({ shopId, ...totals });
      grandTotal += Number(totals.totalAmount);
    }

    // 4) Insert pay_later record (with total_amount)
    const [payLaterRes] = await conn.query(
      `INSERT INTO pay_later (user_id, due_date, is_paid, total_amount, created_at) VALUES (?, DATE_ADD(NOW(), INTERVAL 7 DAY), 0, ?, NOW())`,
      [userId, round2(grandTotal)]
    );
    const payLaterId = payLaterRes.insertId;

    // 5) Insert orders and order_items per shop using server-canonical totals
    const createdOrderIds = [];
    for (const sp of shopSummaries) {
      const { shopId, prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount } = sp;

      const [orderRes] = await conn.query(
        `INSERT INTO orders
         (userId, shopId, subtotal, gstAmount, deliveryFee, discount, totalAmount, payment_type, is_paid, delivery_note, status, pay_later_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'paylater', 0, ?, 'preparing', ?, NOW())`,
        [
          userId,
          shopId,
          round2(subtotal).toFixed(2),
          round2(gstAmount).toFixed(2),
          round2(deliveryFee).toFixed(2),
          round2(discount).toFixed(2),
          round2(totalAmount).toFixed(2),
          delivery_note || "",
          payLaterId
        ]
      );
      const orderId = orderRes.insertId;
      createdOrderIds.push(orderId);

      // insert order_items using prepared snapshot/unitPrice etc
      for (const it of prepared) {
        await conn.query(
          `INSERT INTO order_items
           (orderId, menuId, menuName, variantId, quantity, addons, unitPrice, price, subtotal, snapshot, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            orderId,
            it.menuId,
            it.snapshotName || null,
            it.variantId ?? null,
            it.quantity,
            JSON.stringify(it.addons || []),
            round2(it.unitPrice).toFixed(2),
            round2(it.unitPrice).toFixed(2),
            round2(it.lineSubtotal).toFixed(2),
            JSON.stringify(it.snapshot || { menuName: it.snapshotName, unitPrice: it.unitPrice })
          ]
        );
      }
    }

    // --- NEW: Clear cart items for this user (atomic inside TX) ---
    let deletedCount = 0;
    const shopIds = Array.from(shopIdSet);
    if (cartIds.length) {
      const [delRes1] = await conn.query("DELETE FROM cart_items WHERE cartId IN (?)", [cartIds]);
      // mysql2 returns affectedRows under delRes1.affectedRows (depending on client)
      deletedCount += delRes1 && (delRes1.affectedRows || delRes1.affectedRows === 0) ? delRes1.affectedRows : 0;
    }
    if (shopIds.length) {
      const [delRes2] = await conn.query(
        "DELETE FROM cart_items WHERE userId = ? AND shopId IN (?) AND status = 'active'",
        [userId, shopIds]
      );
      deletedCount += delRes2 && (delRes2.affectedRows || delRes2.affectedRows === 0) ? delRes2.affectedRows : 0;
    }
    // --- END CLEAR CARTS ---

    await conn.commit();
    return res.status(201).json({
      message: "Pay Later order placed",
      payLaterId,
      totalAmount: round2(grandTotal),
      orderIds: createdOrderIds,
      deletedCartRows: deletedCount
    });
  } catch (err) {
    console.error("❌ placePayLaterOrder error:", err);
    try { if (conn) await conn.rollback(); } catch (e) {}
    return res.status(500).json({ message: err.message || "Server error" });
  } finally {
    if (conn) try { await conn.release(); } catch (e) {}
  }
};

const getPopularItems = async (req, res) => {
  try {
    const { lat, lng, debug } = req.query;

    // Build query
    const query = `
      SELECT
        oi.menuId,
        m.menuName,
        m.imageUrl,
        m.price,
        SUM(oi.quantity) AS totalQuantity
      FROM order_items oi
      JOIN orders o ON oi.orderId = o.orderId
      JOIN menus m ON oi.menuId = m.menuId
      WHERE
        o.status = 'delivered'
        AND o.created_at >= NOW() - INTERVAL 1 DAY
        AND o.shopId IN (
          SELECT id FROM shops
          WHERE
            (6371 * acos(
              cos(radians(?)) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(?)) +
              sin(radians(?)) * sin(radians(latitude))
            )) <= 3
        )
      GROUP BY oi.menuId, m.menuName, m.imageUrl, m.price
      ORDER BY totalQuantity DESC
      LIMIT 7;
    `;
    const params = [lat, lng, lat];

    // 🔍 Debug mode
    if (debug === "1") {
      // console.log("📌 SQL QUERY:", query);
      // console.log("📌 Params:", params);
    }

    const [rows] = await db.query(query, params);

// console.log("📌 Query result count:", rows.length);  // <--- add this
// console.log("📌 First row sample:", rows[0]);   
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ PopularItems API error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getMyPayLater = async (req, res) => {
  try {
    const userId = req.user.userId;
    // fetch active pay_later rows for user (pending)
    const [rows] = await db.query(
      `SELECT p.id AS payLaterId, p.total_amount, p.is_paid, p.due_date, p.created_at
       FROM pay_later p
       WHERE p.user_id = ? AND p.is_paid = 0
       ORDER BY p.created_at DESC`,
      [userId]
    );

    // for each pay_later get orders grouped by shop
    const out = [];
    for (const p of rows) {
      const [shops] = await db.query(
        `SELECT o.shopId, s.shopname, s.shopImage, COUNT(*) AS pendingOrders, SUM(o.totalAmount) AS amount
         FROM orders o
         JOIN shops s ON s.id = o.shopId
         WHERE o.pay_later_id = ? AND o.is_paid = 0
         GROUP BY o.shopId`,
        [p.payLaterId]
      );
      out.push({ ...p, shops });
    }

    return res.status(200).json(out);
  } catch (err) {
    console.error("getMyPayLater error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
const getSinglePayLater = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { payLaterId, shopId } = req.params;

    if (!payLaterId || !shopId) {
      return res.status(400).json({ message: "payLaterId and shopId are required" });
    }

    // Fetch pay_later row (ensure ownership and not already fully paid)
    const [[payLaterRow]] = await db.query(
      `SELECT id AS payLaterId, total_amount, is_paid, due_date, created_at
       FROM pay_later
       WHERE id = ? AND user_id = ? AND is_paid = 0`,
      [payLaterId, userId]
    );
    if (!payLaterRow) return res.status(404).json({ message: "Pay Later record not found" });

    // Fetch orders for that shop
    // NOTE: use o.orderId (your schema uses orderId as PK)
    const [orders] = await db.query(
      `SELECT o.orderId AS orderId, o.totalAmount, o.created_at, o.status,
              o.delivery_note, o.is_paid
       FROM orders o
       WHERE o.pay_later_id = ? AND o.shopId = ? AND o.userId = ? AND o.is_paid = 0
       ORDER BY o.created_at DESC`,
      [payLaterId, shopId, userId]
    );

    // Attach items for each order (order_items uses orderId)
    for (const ord of orders) {
      const [items] = await db.query(
        `SELECT menuId, menuName, quantity, unitPrice, subtotal
         FROM order_items WHERE orderId = ?`,
        [ord.orderId]
      );

      // Normalize item fields — if addons stored as string, parse it here (optional)
      ord.items = items.map((it) => {
        // ensure numeric types
        return {
          menuId: it.menuId,
          menuName: it.menuName,
          quantity: Number(it.quantity || 0),
          unitPrice: Number(it.unitPrice || it.price || 0),
          subtotal: Number(it.subtotal || 0),
          addons: (() => {
            try {
              if (typeof it.addons === "string" && it.addons.trim().startsWith("[")) return JSON.parse(it.addons);
            } catch (e) {}
            return it.addons || [];
          })()
        };
      });
    }

    return res.status(200).json({
      ...payLaterRow,
      shopId: Number(shopId),
      orders
    });
  } catch (err) {
    // helpful logging for debugging (remove detailed logging in production)
    console.error("getSinglePayLater error:", err && err.sql ? `${err.code} - ${err.sqlMessage} - SQL: ${err.sql}` : err);
    return res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  placeOrder,
  createOrdersFromCart,
   placePayLaterOrder, 
  getMyOrders,
  getShopOrders,
  getAllOrders,
    getOrderById,
  cancelOrder,
  updateOrderStatus,
  getPopularItems,
  getMyPayLater,
  getSinglePayLater
};
