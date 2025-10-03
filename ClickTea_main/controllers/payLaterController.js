const db = require("../config/db");
const getSinglePayLater = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { payLaterId, shopId } = req.params;
  
      if (!payLaterId || !shopId) {
        return res.status(400).json({ message: "payLaterId and shopId are required" });
      }
  
      // Fetch pay_later row
      const [[payLaterRow]] = await db.query(
        `SELECT id AS payLaterId, total_amount, is_paid, due_date, created_at
         FROM pay_later
         WHERE id = ? AND user_id = ? AND is_paid = 0`,
        [payLaterId, userId]
      );
      if (!payLaterRow) return res.status(404).json({ message: "Pay Later record not found" });
  
      // Fetch orders for that shop
      const [orders] = await db.query(
        `SELECT o.id AS orderId, o.totalAmount, o.created_at, o.status,
                o.delivery_note, o.is_paid
         FROM orders o
         WHERE o.pay_later_id = ? AND o.shopId = ? AND o.userId = ? AND o.is_paid = 0
         ORDER BY o.created_at DESC`,
        [payLaterId, shopId, userId]
      );
  
      for (const ord of orders) {
        const [items] = await db.query(
          `SELECT menuId, menuName, quantity, unitPrice, subtotal
           FROM order_items WHERE orderId = ?`,
          [ord.orderId]
        );
        ord.items = items;
      }
  
      return res.status(200).json({
        ...payLaterRow,
        shopId: Number(shopId),
        orders
      });
    } catch (err) {
      console.error("getSinglePayLater error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
  module.exports = {
getSinglePayLater    
  }