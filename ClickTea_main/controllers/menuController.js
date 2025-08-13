// controllers/menuController.js

const db = require("../config/db");

// ✅ Create Menu
// const createMenu = async (req, res) => {
//   try {
//     const {
//       categoryId,
//       menuName,
//       price,
//       ingredients,
//       isAvailable,
//     } = req.body;

//     const imageUrl = req.file?.filename || null;

//     let shopId;
//     if (req.user.role === "admin") {
//       shopId = req.body.shopId;
//       if (!shopId) {
//         return res.status(400).json({ message: "shopId is required for admin" });
//       }
//     } else {
//       // Get shopId by logged-in shop_owner
//       const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
//       if (!shop.length) {
//         return res.status(404).json({ message: "Shop not found" });
//       }
//       shopId = shop[0].id;
//     }

//     await db.query(
//       `INSERT INTO menus 
//       (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable ?? 1]
//     );

//     res.status(201).json({ message: "Menu created successfully" });
//   } catch (err) {
//     console.error("Create menu error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const createMenu = async (req, res) => {
  try {
    const {
      categoryId,
      menuName,
      price,
      ingredients,
      isAvailable,
    } = req.body;

    const imageUrl = req.file?.filename || null;

    let shopId;

    if (req.user.role === "admin") {
      // Admin must pass shopId explicitly
      shopId = req.body.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "shopId is required for admin" });
      }
    } else {
      // ✅ For shop_owner, fetch shopId from shops table using owner_id
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
      if (!shop.length) {
        return res.status(404).json({ message: "Shop not found for this owner" });
      }
      shopId = shop[0].id;
    }

    // ✅ Insert menu item
    await db.query(
      `INSERT INTO menus 
        (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable ?? 1]
    );

    res.status(201).json({ message: "Menu created successfully" });
  } catch (err) {
    console.error("Create menu error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get My Menus (for shop_owner)
const getMyMenus = async (req, res) => {
  try {
    const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
    if (!shop.length) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const [menus] = await db.query("SELECT * FROM menus WHERE shopId = ?", [shop[0].id]);
    res.status(200).json(menus);
  } catch (err) {
    console.error("Get my menus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Menus (for admin)
const getAllMenus = async (req, res) => {
  try {
    const [menus] = await db.query("SELECT * FROM menus");
    res.status(200).json(menus);
  } catch (err) {
    console.error("Get all menus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Menu
const updateMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    // Check ownership if shop_owner
    if (req.user.role === "shop_owner") {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
      if (!shop.length) return res.status(404).json({ message: "Shop not found" });

      const [menu] = await db.query("SELECT * FROM menus WHERE id = ? AND shopId = ?", [
        menuId,
        shop[0].id,
      ]);
      if (!menu.length) return res.status(403).json({ message: "Unauthorized access" });
    }

    const {
      categoryId,
      menuName,
      price,
      ingredients,
      isAvailable,
      status,
    } = req.body;

    const imageUrl = req.file?.filename;

    await db.query(
      `UPDATE menus SET 
        categoryId = ?, menuName = ?, price = ?, 
        ingredients = ?, isAvailable = ?, status = ?, 
        ${imageUrl ? "imageUrl = ?," : ""} 
        updated_at = NOW() 
      WHERE menuId = ?`,
      imageUrl
        ? [categoryId, menuName, price, ingredients, isAvailable, status, imageUrl, menuId]
        : [categoryId, menuName, price, ingredients, isAvailable, status, menuId]
    );

    res.status(200).json({ message: "Menu updated successfully" });
  } catch (err) {
    console.error("Update menu error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Menu (soft delete)
const deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    await db.query("UPDATE menus SET status = 'inactive' WHERE menuId = ?", [menuId]);

    res.status(200).json({ message: "Menu deleted (soft) successfully" });
  } catch (err) {
    console.error("Delete menu error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Get Menus by Shop ID (for public users)
const getMenusByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;

    const [menus] = await db.query(
      "SELECT * FROM menus WHERE shopId = ? AND status != 'inactive' AND isAvailable = 1",
      [shopId]
    );

    res.status(200).json(menus);
  } catch (err) {
    console.error("Get menus by shopId error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Add this to controllers/menuController.js
const getMenusByCategory = async (req, res) => {
  try {
    const { shopId, categoryId } = req.params;

    const [menus] = await db.query(
      "SELECT * FROM menus WHERE shopId = ? AND categoryId = ? AND status != 'inactive' AND isAvailable = 1",
      [shopId, categoryId]
    );

    res.status(200).json(menus);
  } catch (err) {
    console.error("Get menus by category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMenu,
  getMyMenus,
  getAllMenus,
  updateMenu,
  deleteMenu,
  getMenusByShopId,
  getMenusByCategory
};
