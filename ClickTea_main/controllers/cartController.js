
const db = require("../config/db");


const addToCart = async (req, res) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const { shopId, menuId, variantId, quantity = 1, addons, notes } = req.body;

    if (!userId || !shopId || !menuId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // // ensure single-shop cart
    // const [existingShopRows] = await db.query(
    //   "SELECT DISTINCT shopId FROM cart_items WHERE userId = ? AND status = 'active'",
    //   [userId]
    // );
    // if (existingShopRows.length > 0 && existingShopRows[0].shopId !== shopId) {
    //   return res.status(400).json({ message: "You already have items from another shop. Please clear your cart first." });
    // }
    

    // If same menu + same variant exists, reject (or update — here we reject)
    const [existingItem] = await db.query(
      "SELECT * FROM cart_items WHERE userId = ? AND menuId = ? AND IFNULL(variantId,0) = IFNULL(?,0) AND status = 'active'",
      [userId, menuId, variantId || null]
    );
    if (existingItem.length > 0) {
      return res.status(409).json({ message: "Item already in cart" });
    }

    // Determine authoritative price & name
    let snapshotName = null;
    let snapshotPrice = null;
    let variantSnapshot = null;

    if (variantId) {
      const [vrows] = await db.query(
        "SELECT mv.*, m.menuName FROM menu_variants mv JOIN menus m ON m.menuId = mv.menuId WHERE mv.variantId = ? AND mv.menuId = ?",
        [variantId, menuId]
      );
      if (!vrows.length) return res.status(400).json({ message: "Variant not found for this menu" });
      const v = vrows[0];
      if (v.isAvailable == 0) return res.status(400).json({ message: "Variant not available" });

      snapshotName = v.variantName || v.menuName;
      snapshotPrice = Number(v.price);
      variantSnapshot = { variantId: v.variantId, variantName: v.variantName, price: Number(v.price) };
    } else {
      // fallback to menu price
      const [mrows] = await db.query("SELECT menuName, price FROM menus WHERE menuId = ? LIMIT 1", [menuId]);
      if (!mrows.length) return res.status(400).json({ message: "Menu not found" });
      snapshotName = mrows[0].menuName;
      snapshotPrice = Number(mrows[0].price || 0);
    }

    // insert cart item
    const [result] = await db.query(
      `INSERT INTO cart_items 
        (userId, shopId, menuId, variantId, quantity, addons, notes, snapshotPrice, snapshotName, variantSnapshot, status, added_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [userId, shopId, menuId, variantId || null, quantity, JSON.stringify(addons || []), notes || "", snapshotPrice, snapshotName, JSON.stringify(variantSnapshot)]
    );

    // ✅ use cartId instead of id
    const insertedId = result.insertId;
    const [rows] = await db.query("SELECT * FROM cart_items WHERE cartId = ? LIMIT 1", [insertedId]);

    const cartItem = rows[0] || null;
    return res.status(201).json({ message: "Item added to cart", cartId: insertedId, cartItem });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
const getUserCartByShop = async (req, res) => {
  try {
    const userId = req.user.userId;
    // console.log(userId);
    
    const shopId = req.params.shopId;

    const [items] = await db.query(
      `SELECT 
        c.cartId,
        c.menuId,
        c.variantId,
        c.shopId,
        c.quantity,
        c.notes,
        c.addons,
        c.snapshotName,
        c.snapshotPrice,
        c.variantSnapshot,
        m.menuName,
        m.imageUrl,
        m.ingredients,
        s.shopname,
        s.shopAddress
      FROM cart_items c
      JOIN menus m ON c.menuId = m.menuId
      JOIN shops s ON c.shopId = s.id
      WHERE c.userId = ? AND c.shopId = ? AND c.status = 'active'`,
      [userId, shopId]
    );

    return res.status(200).json(items);
  } catch (err) {
    console.error("Get shop cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const getUserCartAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [rows] = await db.query(
      `SELECT c.cartId, c.menuId, c.variantId, c.shopId, c.quantity, c.notes, c.addons,
              c.snapshotName, c.snapshotPrice, c.variantSnapshot, m.menuName, m.imageUrl,
              s.shopname, s.shopAddress
       FROM cart_items c
       JOIN menus m ON c.menuId = m.menuId
       JOIN shops s ON c.shopId = s.id
       WHERE c.userId = ? AND c.status = 'active'
       ORDER BY c.shopId, c.cartId`,
      [userId]
    );
// console.log(rows,"rows");

    const grouped = rows.reduce((acc, r) => {
      const sid = Number(r.shopId);
      if (!acc[sid]) acc[sid] = { shopId: sid, shopname: r.shopname, items: [] };
      acc[sid].items.push(r);
      return acc;
    }, {});

    return res.status(200).json(Object.values(grouped));
  } catch (err) {
    console.error("Get full cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const { quantity, addons, notes, variantId } = req.body;

    if (quantity === 0) {
      await db.query("DELETE FROM cart_items WHERE cartId = ?", [cartId]);
      return res.status(200).json({ deleted: true, cartId });
    }

    // If variant changed, re-resolve snapshot price/name
    let snapshotName = null;
    let snapshotPrice = null;
    let variantSnapshot = null;

    if (variantId) {
      const [vrows] = await db.query(
        "SELECT mv.*, m.menuName FROM menu_variants mv JOIN menus m ON m.menuId=mv.menuId WHERE mv.variantId = ?",
        [variantId]
      );
      if (vrows.length) {
        const v = vrows[0];
        snapshotName = v.variantName || v.menuName;
        snapshotPrice = Number(v.price);
        variantSnapshot = { variantId: v.variantId, variantName: v.variantName, price: Number(v.price) };
      }
    }

    await db.query(
      `UPDATE cart_items SET quantity = ?, addons = ?, notes = ?, variantId = ?, snapshotPrice = COALESCE(?, snapshotPrice), snapshotName = COALESCE(?, snapshotName), variantSnapshot = COALESCE(?, variantSnapshot) WHERE cartId = ?`,
      [quantity, JSON.stringify(addons || []), notes || "", variantId || null, snapshotPrice, snapshotName, JSON.stringify(variantSnapshot), cartId]
    );

    // return authoritative updated cart item
    const [updatedRows] = await db.query("SELECT * FROM cart_items WHERE cartId = ? LIMIT 1", [cartId]);
    const updatedItem = updatedRows[0] || null;
    return res.status(200).json({ deleted: false, cartItem: updatedItem });
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ message: "Server error" });
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

// const clearCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     await db.query("DELETE FROM cart_items WHERE userId = ? AND status = 'active'", [userId]);
//     res.status(200).json({ message: "Cart cleared" });
//   } catch (err) {
//     console.error("Clear cart error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const shopId = req.query.shopId; // optional
    if (shopId) {
      await db.query("DELETE FROM cart_items WHERE userId = ? AND shopId = ? AND status = 'active'", [userId, shopId]);
    } else {
      await db.query("DELETE FROM cart_items WHERE userId = ? AND status = 'active'", [userId]);
    }
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const cartId = req.params.cartId;
    const userId = req.user.userId;

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
  getUserCartAll,
  updateCartItem,
  saveForLater,
  clearCart,
  deleteCartItem
};