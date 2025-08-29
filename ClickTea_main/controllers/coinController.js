// const db = require("../config/db");
// const { emitInApp, sendPushToUsers } = require("../services/notificatonService");
// const payWithCoins = async (req, res) => {
//   const userId = req.user.id;
//   const { totalAmount, shopId, cartItems, delivery_note } = req.body;

//   try {
//     const [[user]] = await db.query("SELECT coin FROM users WHERE id = ?", [userId]);

//     if (!user || user.coin < totalAmount) {
//       return res.status(400).json({ message: "Insufficient coins" });
//     }

//     // 1️⃣ Deduct coins
//     await db.query("UPDATE users SET coin = coin - ? WHERE id = ?", [totalAmount, userId]);

//     // 2️⃣ Create Order
//     const [orderResult] = await db.query(
//       `INSERT INTO orders (userId, shopId, totalAmount, payment_type, is_paid, status, delivery_note)
//        VALUES (?, ?, ?, 'coin', 1, 'pending', ?)`,
//       [userId, shopId, totalAmount, delivery_note || ""]
//     );
//     const orderId = orderResult.insertId;

//     // 3️⃣ Insert into order_items
//     for (let item of cartItems) {
//       await db.query(
//         `INSERT INTO order_items (orderId, menuId, quantity, addons, price, subtotal, status)
//          VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
//         [
//           orderId,
//           item.menuId,
//           item.quantity,
//           JSON.stringify(item.addons || []),
//           item.price,
//           item.quantity * item.price,
//         ]
//       );
//     }

//     // 4️⃣ Add coin_history
//     await db.query(
//       `INSERT INTO coin_history (userId, orderId, type, amount, reason)
//        VALUES (?, ?, 'debit', ?, 'Order Payment')`,
//       [userId, orderId, totalAmount]
//     );

//     // 5️⃣ Clear cart
//     await db.query("DELETE FROM cart_items WHERE userId = ? AND status = 'active'", [userId]);
// try {
//   // find shop owner / vendor(s)
//   const [[shopOwnerRow]] = await db.query("SELECT owner_id FROM shops WHERE id = ?", [shopId]);
//   const vendorIds = shopOwnerRow ? [shopOwnerRow.owner_id] : [];

//   const title = "New Order Placed";
//   const body = `Order #${orderId} has been placed.`;
//   const data = { type: "order_placed", orderId, shopId, payment_type: "coin" };

//   // 1) Emit in-app socket event
//   if (vendorIds.length) {
//     emitInApp(req.io, vendorIds, "order:placed", data);
//   }

//   // 2) Send push notifications (expo tokens stored in DB)
//   if (vendorIds.length) {
//     try {
//       await sendPushToUsers(vendorIds, title, body, data);
//     } catch (pushErr) {
//       console.warn("sendPushToUsers failed:", pushErr);
//     }
//   }
// } catch (notifyErr) {
//   console.warn("notify vendor error (non-fatal):", notifyErr);
// }

// res.status(200).json({ message: "Payment successful", orderId });
//     res.status(200).json({ message: "Payment successful", orderId });
//   } catch (err) {
//     console.error("💥 Coin payment failed:", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// controllers/coinController.js

// controllers/coinController.js
const db = require("../config/db"); // mysql2 pool
const {
  emitInApp,
  sendPushToUsers,
} = require("../services/notificatonService");

const payWithCoins = async (req, res) => {
  const userId = req.user.id;
  const {
    totalAmount: totalAmountRaw,
    shopId,
    cartItems = [],
    delivery_note = "",
  } = req.body;
  const totalAmount = Number(totalAmountRaw) || 0;
  const io = req.io;

  if (!shopId) return res.status(400).json({ message: "Missing shopId" });
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "cartItems required" });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Lock user row
    const [[userRow]] = await conn.query(
      "SELECT coin FROM users WHERE id = ? FOR UPDATE",
      [userId]
    );
    if (!userRow || Number(userRow.coin) < totalAmount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Deduct coins
    await conn.query("UPDATE users SET coin = coin - ? WHERE id = ?", [
      totalAmount,
      userId,
    ]);

    // Create order (paid)
    const [orderResult] = await conn.query(
      `INSERT INTO orders (userId, shopId, totalAmount, payment_type, is_paid, status, delivery_note)
       VALUES (?, ?, ?, 'coin', 1, 'pending', ?)`,
      [userId, shopId, totalAmount, delivery_note]
    );
    const orderId = orderResult.insertId;

    // Add order_items with server-side subtotal
    for (const item of cartItems) {
      const menuId = item.menuId;
      const quantity = Number(item.quantity) || 0;
      if (!menuId || quantity <= 0) {
        await conn.rollback();
        return res.status(400).json({ message: "Invalid cart item", item });
      }

      let price =
        typeof item.price !== "undefined" && item.price !== null
          ? Number(item.price)
          : null;
      if (price === null) {
        const [menuRows] = await conn.query(
          "SELECT price FROM menus WHERE menuId = ? LIMIT 1",
          [menuId]
        );
        if (!menuRows.length) {
          await conn.rollback();
          return res.status(400).json({ message: `Menu not found: ${menuId}` });
        }
        price = Number(menuRows[0].price) || 0;
      }

      const subtotal = Number((price * quantity).toFixed(2));
      await conn.query(
        `INSERT INTO order_items (orderId, menuId, quantity, addons, price, subtotal, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderId,
          menuId,
          quantity,
          JSON.stringify(item.addons || []),
          price.toFixed(2),
          subtotal,
        ]
      );
    }

    // coin history
    await conn.query(
      `INSERT INTO coin_history (userId, orderId, type, amount, reason)
       VALUES (?, ?, 'debit', ?, 'Order Payment')`,
      [userId, orderId, totalAmount]
    );

    // clear cart
    await conn.query(
      "DELETE FROM cart_items WHERE userId = ? AND shopId = ? AND status = 'active'",
      [userId, shopId]
    );

    await conn.commit();

    // Respond
    res.status(200).json({ message: "Payment successful", orderId });

    // Async notifications (non-blocking)
    (async () => {
      try {
        const [[shopRow]] = await db.query(
          "SELECT owner_id FROM shops WHERE id = ?",
          [shopId]
        );
        const vendorIds = shopRow && shopRow.owner_id ? [shopRow.owner_id] : [];

        if (io && vendorIds.length) {
          try {
            emitInApp(io, vendorIds, "order:placed", {
              type: "order_placed",
              orderId,
              shopId,
            });
          } catch (e) {
            console.warn("emitInApp failed:", e);
          }
        }

        if (vendorIds.length) {
          try {
            await sendPushToUsers(
              vendorIds,
              "New Order Placed",
              `Order #${orderId} has been placed.`,
              { type: "order_placed", orderId }
            );
          } catch (pushErr) {
            console.warn("sendPushToUsers failed:", pushErr);
          }
        }
      } catch (asyncErr) {
        console.error("Async notification error:", asyncErr);
      }
    })();

    return;
  } catch (err) {
    console.error("💥 Coin payment failed:", err);
    try {
      if (conn) await conn.rollback();
    } catch (rb) {
      console.error("rollback failed:", rb);
    }
    if (!res.headersSent)
      return res.status(500).json({ message: "Internal server error" });
    return;
  } finally {
    if (conn)
      try {
        await conn.release();
      } catch (_) {}
  }
};
const getCoinBalance = async (req, res) => {
  try {
    const userId = req.user.id;
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
module.exports = { payWithCoins, getCoinBalance };
