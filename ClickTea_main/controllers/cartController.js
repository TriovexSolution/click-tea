
const db = require("../config/db");

const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { shopId, menuId, quantity, addons, notes } = req.body;

    if (!userId || !shopId || !menuId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [existing] = await db.query(
      "SELECT DISTINCT shopId FROM cart_items WHERE userId = ? AND status = 'active'",
      [userId]
    );

    if (existing.length > 0 && existing[0].shopId !== shopId) {
      return res.status(400).json({ message: "You already have items from another shop. Please clear your cart first." });
    }

    const [item] = await db.query(
      "SELECT * FROM cart_items WHERE userId = ? AND menuId = ? AND status = 'active'",
      [userId, menuId]
    );

    if (item.length > 0) {
      return res.status(409).json({ message: "Item already in cart" });
    }

    const [result] = await db.query(
      `INSERT INTO cart_items (userId, shopId, menuId, quantity, addons, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, shopId, menuId, quantity || 1, JSON.stringify(addons || []), notes || ""]
    );

    res.status(201).json({ message: "Item added to cart", cartId: result.insertId });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getUserCartByShop = async (req, res) => {
  try {
    const userId = req.user.id;
    const shopId = req.params.shopId;

    const [items] = await db.query(
      `SELECT 
        c.cartId,
        c.menuId,
        c.shopId,
        c.quantity,
        c.notes,
        c.addons,
        m.menuName,
        m.imageUrl,
        m.price,
        m.ingredients,
                s.shopname,
        s.shopAddress
     FROM cart_items c
      JOIN menus m ON c.menuId = m.menuId
      JOIN shops s ON c.shopId = s.id
      WHERE c.userId = ? AND c.shopId = ? AND c.status = 'active'`,
      [userId, shopId]
    );

    res.status(200).json(items);
  } catch (err) {
    console.error("Get shop cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const updateCartItem = async (req, res) => {

  try {
    const cartId = req.params.cartId;
    const { quantity, addons, notes } = req.body;

    if (quantity === 0) {
      await db.query("DELETE FROM cart_items WHERE cartId = ?", [cartId]);
      return res.status(200).json({ message: "Item removed from cart" });
    }

    const [result] = await db.query(
      `UPDATE cart_items SET quantity = ?, addons = ?, notes = ? WHERE cartId = ?`,
      [quantity, JSON.stringify(addons || []), notes || "", cartId]
    );
    res.status(200).json({ message: "Cart item updated" });
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const saveForLater = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    await db.query("UPDATE cart_items SET status = 'saved' WHERE cartId = ?", [cartId]);
    res.status(200).json({ message: "Item saved for later" });
  } catch (err) {
    console.error("Save for later error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query("DELETE FROM cart_items WHERE userId = ? AND status = 'active'", [userId]);
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const deleteCartItem = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const userId = req.user.id;

    const [result] = await db.query(
      "DELETE FROM cart_items WHERE cartId = ? AND userId = ?",
      [cartId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found or unauthorized" });
    }

    res.status(200).json({ message: "Item deleted from cart" });
  } catch (err) {
    console.error("❌ Delete cart item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addToCart,
  getUserCartByShop,
  updateCartItem,
  saveForLater,
  clearCart,
  deleteCartItem
};