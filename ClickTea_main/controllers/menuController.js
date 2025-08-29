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
//       // Admin must pass shopId explicitly
//       shopId = req.body.shopId;
//       if (!shopId) {
//         return res.status(400).json({ message: "shopId is required for admin" });
//       }
//     } else {
//       // ✅ For shop_owner, fetch shopId from shops table using owner_id
//       const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
//       if (!shop.length) {
//         return res.status(404).json({ message: "Shop not found for this owner" });
//       }
//       shopId = shop[0].id;
//     }

//     // ✅ Insert menu item
//     await db.query(
//       `INSERT INTO menus 
//         (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable) 
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
      variants // expect stringified JSON or array
    } = req.body;

    const imageUrl = req.file?.filename || null;
    let shopId;

    if (req.user.role === "admin") {
      shopId = req.body.shopId;
      if (!shopId) return res.status(400).json({ message: "shopId is required for admin" });
    } else {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
      if (!shop.length) return res.status(404).json({ message: "Shop not found for this owner" });
      shopId = shop[0].id;
    }

    // insert menu
    const [menuResult] = await db.query(
      `INSERT INTO menus (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [shopId, categoryId, menuName, price || 0, imageUrl, ingredients || null, isAvailable ?? 1]
    );
    const menuId = menuResult.insertId;

    // parse variants; if none provided, create a default variant using base price
    let parsed = [];
    if (variants) {
      try {
        parsed = typeof variants === "string" ? JSON.parse(variants) : variants;
      } catch (e) {
        parsed = [];
      }
    }
    if (!parsed || parsed.length === 0) {
      parsed = [{ label: "", price: Number(price || 0) }];
    }

    // insert variants
    for (const v of parsed) {
      const variantName = v.label || "";
      const vprice = Number(v.price || 0);
      await db.query(
        `INSERT INTO menu_variants (menuId, variantName, price, created_at) VALUES (?, ?, ?, NOW())`,
        [menuId, variantName, vprice]
      );
    }

    return res.status(201).json({ message: "Menu created successfully", menuId });
  } catch (err) {
    console.error("Create menu error:", err);
    return res.status(500).json({ message: "Server error" });
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
// controllers/categoryController.js (or similar)
const getMenusByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = (req.query.search || "").trim();
    const offset = (page - 1) * limit;

    // If you use prepared statements (recommended)
    // Filter menus by categoryId, status & availability
    const searchFilter = search ? `AND m.menuName LIKE ?` : "";
    const sql = `
      SELECT 
        m.menuId,
        m.menuName,
        m.price,
        m.imageUrl,
        m.ingredients,
        m.isAvailable,
        m.rating
      FROM menus m
      WHERE m.status = 'active' 
        AND m.isAvailable = 1
        AND m.categoryId = ?
        ${searchFilter}
      ORDER BY m.menuName ASC
      LIMIT ? OFFSET ?
    `;

    const params = search
      ? [parseInt(id, 10), `%${search}%`, limit, offset]
      : [parseInt(id, 10), limit, offset];

    const [rows] = await db.query(sql, params);

    // count total for pagination
    const countSql = `
      SELECT COUNT(*) as total 
      FROM menus m
      WHERE m.status = 'active' 
        AND m.isAvailable = 1
        AND m.categoryId = ?
        ${search ? `AND m.menuName LIKE ?` : ""}
    `;
    const countParams = search
      ? [parseInt(id, 10), `%${search}%`]
      : [parseInt(id, 10)];
    const [countRes] = await db.query(countSql, countParams);
    const total = countRes[0].total ?? 0;

    res.status(200).json({
      page,
      limit,
      total,
      data: rows,
    });
  } catch (error) {
    console.error("getMenusByCategory error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getMenuById = async (req, res) => {
  try {
    const menuId = parseInt(req.params.id, 10);
    if (!Number.isFinite(menuId)) {
      return res.status(400).json({ message: "Invalid menuId" });
    }

    // Query: fetch menu and include category and shop basic info
    const sql = `
      SELECT 
        m.menuId,
        m.menuName,
        m.price,
        m.imageUrl,
        m.ingredients,
        m.isAvailable,
        m.rating,
        m.status,
        m.categoryId,
        c.categoryName,
        c.categoryImage AS categoryImage,
        c.shop_id AS categoryShopId,
s.id AS shopId,
s.shopname AS shopName,
s.shopAddress AS shopAddress
      FROM menus m
      LEFT JOIN categories c ON m.categoryId = c.categoryId
      LEFT JOIN shops s ON m.shopId = s.id
      WHERE m.menuId = ? AND m.status != 'inactive'
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [menuId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const r = rows[0];

    // build response object
    const menu = {
      menuId: r.menuId,
      menuName: r.menuName,
      price: r.price,
      imageUrl: r.imageUrl,
      ingredients: r.ingredients,
      isAvailable: r.isAvailable,
      rating: r.rating,
      status: r.status,
      category: r.categoryId
        ? {
            categoryId: r.categoryId,
            categoryName: r.categoryName,
            categoryImage: r.categoryImage,
            shop_id: r.categoryShopId,
          }
        : null,
      shop:
        r.shopId != null
          ? {
              shopId: r.shopId,
              shopName: r.shopName,
              shopAddress: r.shopAddress,
            }
          : null,
    };

    return res.status(200).json({ data: menu });
  } catch (err) {
    console.error("getMenuById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  createMenu,
  getMyMenus,
  getAllMenus,
  updateMenu,
  deleteMenu,
  getMenusByShopId,
  getMenusByCategory,
  getMenuById
};
