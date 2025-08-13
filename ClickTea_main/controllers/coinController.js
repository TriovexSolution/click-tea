const db = require("../config/db");

const payWithCoins = async (req, res) => {
  const userId = req.user.id;
  const { totalAmount, shopId, cartItems, delivery_note } = req.body;

  try {
    const [[user]] = await db.query("SELECT coin FROM users WHERE id = ?", [userId]);

    if (!user || user.coin < totalAmount) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // 1️⃣ Deduct coins
    await db.query("UPDATE users SET coin = coin - ? WHERE id = ?", [totalAmount, userId]);

    // 2️⃣ Create Order
    const [orderResult] = await db.query(
      `INSERT INTO orders (userId, shopId, totalAmount, payment_type, is_paid, status, delivery_note)
       VALUES (?, ?, ?, 'coin', 1, 'pending', ?)`,
      [userId, shopId, totalAmount, delivery_note || ""]
    );
    const orderId = orderResult.insertId;

    // 3️⃣ Insert into order_items
    for (let item of cartItems) {
      await db.query(
        `INSERT INTO order_items (orderId, menuId, quantity, addons, price, subtotal, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderId,
          item.menuId,
          item.quantity,
          JSON.stringify(item.addons || []),
          item.price,
          item.quantity * item.price,
        ]
      );
    }

    // 4️⃣ Add coin_history
    await db.query(
      `INSERT INTO coin_history (userId, orderId, type, amount, reason)
       VALUES (?, ?, 'debit', ?, 'Order Payment')`,
      [userId, orderId, totalAmount]
    );

    // 5️⃣ Clear cart
    await db.query("DELETE FROM cart_items WHERE userId = ? AND status = 'active'", [userId]);

    res.status(200).json({ message: "Payment successful", orderId });
  } catch (err) {
    console.error("💥 Coin payment failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { payWithCoins };
