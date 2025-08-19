const db = require("../config/db");
// ✅ 1. Place Order (move from cart → orders)
const placeOrder = async (req, res) => {
  try {
    const { cartItems, shopId, totalAmount, payment_type, delivery_note } =
      req.body;
    const userId = req.user.id;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 1. Insert into orders table
    const [orderResult] = await db.query(
      `INSERT INTO orders 
        (userId, shopId, totalAmount, payment_type, is_paid, delivery_note) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, shopId, totalAmount, payment_type, 0, delivery_note]
    );
    const orderId = orderResult.insertId;

    // 2. Insert items into order_items
    for (const item of cartItems) {
      const { menuId, quantity, addons, price, subtotal } = item;
      await db.query(
        `INSERT INTO order_items 
          (orderId, menuId, quantity, addons, price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, menuId, quantity, JSON.stringify(addons), price, subtotal]
      );
    }

    // 3. (Optional) Clear cart after placing order if you're storing carts in DB

    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Get Orders for a User
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

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
    if (user.role === "user" && order.userId !== user.id) {
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

// ✅ 5. Cancel Order (user/shop_owner/admin)
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const role = req.user.role;

    // Get order and user/shop checks
    const [orders] = await db.query("SELECT * FROM orders WHERE orderId = ?", [orderId]);
    if (!orders.length) return res.status(404).json({ message: "Order not found" });

    const order = orders[0];

    // 🔒 Authorization
    if (role === "user" && order.userId !== req.user.id)
      return res.status(403).json({ message: "You can't cancel this order" });

    if (role === "shop_owner") {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
      if (!shop.length || shop[0].id !== order.shopId)
        return res.status(403).json({ message: "You can't cancel this order" });
    }

    // ✅ Update order status
    await db.query("UPDATE orders SET status = 'cancelled' WHERE orderId = ?", [orderId]);

    // ✅ Refund coins only if paid using 'coin'
    if (order.payment_type === "coin") {
      // Refund coins to user
      await db.query("UPDATE users SET coin = coin + ? WHERE id = ?", [order.totalAmount, order.userId]);

      // Add coin_history log
      await db.query(
        `INSERT INTO coin_history (userId, orderId, type, amount, reason) 
         VALUES (?, ?, 'credit', ?, 'Order Cancelled')`,
        [order.userId, orderId, order.totalAmount]
      );
    }

    res.status(200).json({
      message: `Order cancelled successfully${order.payment_type === "coin" ? ' — refund added as ClickTea Coins' : ''}`,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ 6. Update order status (vendor)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const role = req.user.role;

    let query = "SELECT * FROM orders WHERE orderId = ?";
    let params = [orderId];

    // If shop owner, restrict to their own shop
    if (role === "shop_owner") {
      const shopId = req.user.shopId;
      if (!shopId) {
        return res
          .status(403)
          .json({ message: "No shop associated with your account" });
      }
      query += " AND shopId = ?";
      params.push(shopId);
    }

    const [order] = await db.query(query, params);

    if (order.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    await db.query("UPDATE orders SET status = ? WHERE orderId = ?", [
      status,
      orderId,
    ]);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ New: Place Order with Pay Later
const placePayLaterOrder = async (req, res) => {
  try {
    const { cartItems, delivery_note } = req.body;
    const userId = req.user.id;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // ✅ 1. Check subscription
    const [subs] = await db.query(
      `SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );
    if (!subs.length) {
      return res.status(403).json({ message: "No active subscription" });
    }

    // ✅ 2. Group items by shop

const shopMap = {};
for (let item of cartItems) {
  const { shopId } = item;

  if (!shopId || isNaN(Number(shopId))) {
    console.error("❌ Invalid shopId in cartItem:", item);
    return res.status(400).json({
      message: "Invalid cart item — missing or invalid shopId",
      item,
    });
  }

  const sid = Number(shopId);
  if (!shopMap[sid]) shopMap[sid] = [];
  shopMap[sid].push(item);
}

    // ✅ 3. Create Pay Later entry
    const [payLaterRes] = await db.query(
      `INSERT INTO pay_later (user_id, due_date, is_paid, total_amount) VALUES (?, DATE_ADD(NOW(), INTERVAL 7 DAY), 0, 0.00)`,
      [userId]
    );
    const payLaterId = payLaterRes.insertId;

    let grandTotal = 0;
    const createdOrderIds = [];

    // ✅ 4. Create orders by shop
    for (const shopId in shopMap) {
      const items = shopMap[shopId];
      const total = items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0);
      grandTotal += total;

      const [orderRes] = await db.query(
        `INSERT INTO orders (userId, shopId, totalAmount, payment_type, is_paid, delivery_note, pay_later_id) 
         VALUES (?, ?, ?, 'PayLater', 0, ?, ?)`,
        [userId, shopId, total, delivery_note || "", payLaterId]
      );
      const orderId = orderRes.insertId;
      createdOrderIds.push(orderId);

      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (orderId, menuId, quantity, addons, price, subtotal) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.menuId,
            item.quantity,
            JSON.stringify(item.addons || []),
            item.price,
            item.subtotal,
          ]
        );
      }
    }

    // ✅ 5. Update Pay Later total
    await db.query(
      `UPDATE pay_later SET total_amount = ? WHERE id = ?`,
      [grandTotal.toFixed(2), payLaterId]
    );

    res.status(201).json({
      message: "Pay Later order placed",
      payLaterId,
      totalAmount: grandTotal,
      orderIds: createdOrderIds,
    });
  } catch (err) {
    console.error("❌ placePayLaterOrder error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// const getPopularItems = async (req, res) => {
//   const { lat, lng } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ message: "Latitude and longitude are required" });
//   }

//   // Cache key based on lat/lng rounded to 3 decimals (about 100m precision)
//   const cacheKey = `popular_items_${parseFloat(lat).toFixed(3)}_${parseFloat(lng).toFixed(3)}`;

//   try {
//     // Try fetching cached data first
//      const cachedData = await redisClient.get(cacheKey);
//     if (cachedData) {
//       return res.status(200).json(JSON.parse(cachedData));
//     }

//     // SQL query for popular items
//     const query = `
//       SELECT
//         oi.menuId,
//         m.menuName,
//         m.imageUrl,
//         SUM(oi.quantity) AS totalQuantity
//       FROM
//         order_items oi
//       JOIN orders o ON oi.orderId = o.orderId
//       JOIN menus m ON oi.menuId = m.menuId
//       WHERE
//         o.status = 'delivered'
//         AND o.ordered_at >= NOW() - INTERVAL 1 DAY
//         AND o.shopId IN (
//           SELECT id FROM shops
//           WHERE
//             (6371 * acos(
//               cos(radians(?)) * cos(radians(latitude)) *
//               cos(radians(longitude) - radians(?)) +
//               sin(radians(?)) * sin(radians(latitude))
//             )) <= 3
//         )
//       GROUP BY oi.menuId
//       ORDER BY totalQuantity DESC
//       LIMIT 7;
//     `;

//     const params = [lat, lng, lat];

//     const [popularItems] = await db.query(query, params);

//     // Cache results for 10 minutes (600 seconds)
//     await setexAsync(cacheKey, 600, JSON.stringify(popularItems));

//     res.status(200).json(popularItems);
//   } catch (err) {
//     console.error("Error fetching popular items:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const getPopularItems = async (req, res) => {
  // console.log("hit /popular-items", req.query, req.user?.id);
  const { lat, lng, debug } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude are required" });
  }

  try {
    const query = `
      SELECT
        oi.menuId,
        m.menuName,
        m.imageUrl,
        m.price,
        SUM(oi.quantity) AS totalQuantity
      FROM
        order_items oi
      JOIN orders o ON oi.orderId = o.orderId
      JOIN menus m ON oi.menuId = m.menuId
      WHERE
        o.status = 'delivered'
        AND o.ordered_at >= NOW() - INTERVAL 1 DAY
        AND o.shopId IN (
          SELECT id FROM shops
          WHERE
            (6371 * acos(
              cos(radians(?)) * cos(radians(latitude)) *
              cos(radians(longitude) - radians(?)) +
              sin(radians(?)) * sin(radians(latitude))
            )) <= 3
        )
      GROUP BY
        oi.menuId, m.menuName, m.imageUrl, m.price
      ORDER BY totalQuantity DESC
      LIMIT 7;
    `;

    const params = [lat, lng, lat];

    const [popularItems] = await db.query(query, params);

    // optional debug info (development only)
    if (debug === '1') {
      console.log('DEBUG popularItems length:', popularItems.length);
      return res.status(200).json({
        debug: {
          query,
          params,
          returnedCount: popularItems.length,
          sample: popularItems.slice(0, 5),
        },
        popularItems,
      });
    }

    return res.status(200).json(popularItems);
  } catch (err) {
    console.error("Error fetching popular items:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  placeOrder,
   placePayLaterOrder, 
  getMyOrders,
  getShopOrders,
  getAllOrders,
    getOrderById,
  cancelOrder,
  updateOrderStatus,
  getPopularItems
};
