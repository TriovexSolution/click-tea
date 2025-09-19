const db = require("../config/db"); // mysql2 pool
const {
  emitInApp,
  sendPushToUsers,
} = require("../services/notificatonService");
const { sanitizeCartItems, computeOrderTotals } = require("../utils/orderHelper");
const payWithCoins = async (req, res) => {
  const userId = req.user?.userId;
  const { shopId, cartItems: rawCart, delivery_note = "" } = req.body;

  if (!userId) return res.status(401).json({ message: "User not authenticated" });
  if (!shopId) return res.status(400).json({ message: "Missing shopId" });
  if (!Array.isArray(rawCart) || rawCart.length === 0) return res.status(400).json({ message: "cartItems required" });

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const sanitized = sanitizeCartItems(rawCart);
    const { prepared, subtotal, gstAmount, deliveryFee, discount, totalAmount } =
      await computeOrderTotals(conn, sanitized);

    // lock user row and check coins
    const [[userRow]] = await conn.query("SELECT coin FROM users WHERE id = ? FOR UPDATE", [userId]);
    if (!userRow || Number(userRow.coin) < totalAmount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // deduct coins
    await conn.query("UPDATE users SET coin = coin - ? WHERE id = ?", [totalAmount.toFixed(2), userId]);

    // insert order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (userId, shopId, subtotal, gstAmount, deliveryFee, discount, totalAmount, payment_type, is_paid, status, delivery_note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'coin', 1, 'preparing', ?, NOW())`,
      [userId, shopId, subtotal.toFixed(2), gstAmount.toFixed(2), deliveryFee.toFixed(2), discount.toFixed(2), totalAmount.toFixed(2), delivery_note]
    );
    const orderId = orderResult.insertId;

    // insert order_items
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
          it.unitPrice.toFixed(2),
          it.subtotal.toFixed(2),
          JSON.stringify({ menuName: it.snapshotName, variant: it.variantSnapshot, unitPrice: it.unitPrice, qty: it.quantity })
        ]
      );
    }

    // coin history
    await conn.query(`INSERT INTO coin_history (userId, orderId, type, amount, reason) VALUES (?, ?, 'debit', ?, 'Order Payment')`, [userId, orderId, totalAmount.toFixed(2)]);

    // clear cart for this user + shop
    await conn.query("DELETE FROM cart_items WHERE userId = ? AND shopId = ? AND status = 'active'", [userId, shopId]);

    await conn.commit();
    return res.status(200).json({ message: "Payment successful", orderId });
  } catch (err) {
    console.error("Coin payment failed:", err);
    try { if (conn) await conn.rollback(); } catch (_) {}
    if (!res.headersSent) return res.status(500).json({ message: err.message || "Internal server error" });
  } finally {
    if (conn) try { await conn.release(); } catch (_) {}
  }
};
const payCartWithCoins = async (req, res) => {
  const userId = req.user.userId;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [cartRows] = await conn.query("SELECT * FROM cart_items WHERE userId = ? AND status = 'active' ORDER BY shopId, cartId", [userId]);
    if (!cartRows.length) { await conn.rollback(); return res.status(400).json({ message: "Cart empty" }); }

    // compute totals per shop similar to createOrdersFromCart
    const grouped = cartRows.reduce((acc, r) => { const sid=Number(r.shopId); if(!acc[sid]) acc[sid]=[]; acc[sid].push(r); return acc; }, {});
    let grandTotal = 0;
    const shopPayloads = [];

    for (const shopIdStr of Object.keys(grouped)) {
      const items = grouped[shopIdStr];
      let subtotal = 0;
      const prepared = items.map(it => {
        const qty = Number(it.quantity); const unit = Number(it.snapshotPrice||0);
        let addonsTotal = 0; let addons=[];
        try { addons = JSON.parse(it.addons||"[]"); } catch(e){addons=[];}
        addons.forEach(a=>{ addonsTotal += Number(a.price||0) * (Number(a.qty||1)); });
        const line = (unit * qty) + addonsTotal;
        subtotal += line;
        return { cartId: it.cartId, menuId: it.menuId, qty, unit, addons, line, snapshotName: it.snapshotName };
      });
      const gstAmount = 0, deliveryFee = 0, discount = 0;
      const totalAmount = subtotal + gstAmount + deliveryFee - discount;
      grandTotal += totalAmount;
      shopPayloads.push({ shopId: Number(shopIdStr), items: prepared, subtotal, totalAmount });
    }

    // Lock user row & check coins
    const [[userRow]] = await conn.query("SELECT coin FROM users WHERE id = ? FOR UPDATE", [userId]);
    if (!userRow || Number(userRow.coin) < grandTotal) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Deduct coins once
    await conn.query("UPDATE users SET coin = coin - ? WHERE id = ?", [grandTotal.toFixed(2), userId]);

    // Create orders per shop & order_items; delete cart items
    const out = [];
    for (const sp of shopPayloads) {
      const [orderRes] = await conn.query(
        `INSERT INTO orders (userId, shopId, subtotal, gstAmount, deliveryFee, discount, totalAmount, payment_type, is_paid, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'coin', 1, 'preparing', NOW())`,
        [userId, sp.shopId, sp.subtotal.toFixed(2), 0, 0, 0, sp.totalAmount.toFixed(2)]
      );
      const orderId = orderRes.insertId;
      for (const it of sp.items) {
        await conn.query(
          `INSERT INTO order_items (orderId, menuId, quantity, addons, price, subtotal, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [orderId, it.menuId, it.qty, JSON.stringify(it.addons || []), it.unit.toFixed(2), it.line.toFixed(2)]
        );
      }
      const cartIds = sp.items.map(i=>i.cartId);
      if (cartIds.length) await conn.query("DELETE FROM cart_items WHERE cartId IN (?)", [cartIds]);
      out.push({ orderId, shopId: sp.shopId, total: sp.totalAmount });
      // insert coin_history per order
      await conn.query(`INSERT INTO coin_history (userId, orderId, type, amount, reason, created_at) VALUES (?, ?, 'debit', ?, 'Order Payment', NOW())`, [userId, orderId, sp.totalAmount.toFixed(2)]);
    }

    await conn.commit();
    return res.status(200).json({ message: "Payment successful", grandTotal: Number(grandTotal.toFixed(2)), orders: out });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("payCartWithCoins error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) try { await conn.release(); } catch(_) {}
  }
};
const getCoinBalance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [[row]] = await db.query("SELECT coin FROM users WHERE id = ?", [
      userId,
    ]);

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ coin: row.coin });
  } catch (err) {
    console.error("💥 Get coin balance failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getCoinHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await db.query(
      `SELECT id, orderId, type, amount, reason, created_at
       FROM coin_history
       WHERE userId = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("💥 Get coin history failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { payWithCoins,payCartWithCoins, getCoinBalance, getCoinHistory };
