// // controllers/menuController.js

// const db = require("../config/db");

// const createMenu = async (req, res) => {
//   try {
//     const {
//       categoryId,
//       menuName,
//       price,
//       ingredients,
//       isAvailable,
//       variants // string or array
//     } = req.body;

//     const imageUrl = req.file?.filename || null;
//     let shopId = null;

//     // Prefer to infer shopId for shop_owner from token (owner id)
//     if (req.user?.role === "shop_owner") {
//       // use whichever id is set by your verifyToken middleware
//       const ownerId = req.user.userId ?? req.user.id ?? null;
//       if (!ownerId) {
//         console.warn("[createMenu] owner id missing on req.user:", req.user);
//         return res.status(401).json({ message: "Unauthorized: owner id missing" });
//       }

//       const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [ownerId]);
//       if (!shopRows.length) {
//         return res.status(404).json({ message: "Shop not found for this owner" });
//       }
//       shopId = shopRows[0].id;
//     } else if (req.user?.role === "admin") {
//       // admin may create for any shop; accept shopId in body if provided
//       shopId = req.body.shopId ?? null;
//       if (!shopId) return res.status(400).json({ message: "shopId is required for admin" });
//     } else {
//       // fallback - try to infer by req.user.id as before (if your app has this flow)
//       const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
//       if (!shopRows.length) return res.status(404).json({ message: "Shop not found for this user" });
//       shopId = shopRows[0].id;
//     }

//     // INSERT menu...
//     const [menuResult] = await db.query(
//       `INSERT INTO menus (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable, created_at)
//        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [shopId, categoryId, menuName, Number(price || 0), imageUrl, ingredients || null, isAvailable ?? 1]
//     );
//     const menuId = menuResult.insertId;

//     // variants parsing and insertion (keep your existing logic)
//     let parsed = [];
//     if (variants) {
//       try { parsed = typeof variants === "string" ? JSON.parse(variants) : variants; } catch (e) { parsed = []; }
//     }
//     if (!parsed || parsed.length === 0) parsed = [{ label: "", price: Number(price || 0) }];

//     for (const v of parsed) {
//       const variantName = v.label || "";
//       const vprice = Number(v.price || 0);
//       await db.query(
//         `INSERT INTO menu_variants (menuId, variantName, price, created_at) VALUES (?, ?, ?, NOW())`,
//         [menuId, variantName, vprice]
//       );
//     }

//     return res.status(201).json({ message: "Menu created successfully", menuId });
//   } catch (err) {
//     console.error("Create menu error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get My Menus (for shop_owner)
// const getMyMenus = async (req, res) => {
//   try {
//     const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
//     if (!shop.length) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     const [menus] = await db.query("SELECT * FROM menus WHERE shopId = ?", [shop[0].id]);
//     res.status(200).json(menus);
//   } catch (err) {
//     console.error("Get my menus error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get All Menus (for admin)
// const getAllMenus = async (req, res) => {
//   try {
//     const [menus] = await db.query("SELECT * FROM menus");
//     res.status(200).json(menus);
//   } catch (err) {
//     console.error("Get all menus error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Update Menu
// const updateMenu = async (req, res) => {
//   try {
//     const menuId = req.params.id;

//     // Check ownership if shop_owner
//     if (req.user.role === "shop_owner") {
//       const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);
//       if (!shop.length) return res.status(404).json({ message: "Shop not found" });

//       const [menu] = await db.query("SELECT * FROM menus WHERE id = ? AND shopId = ?", [
//         menuId,
//         shop[0].id,
//       ]);
//       if (!menu.length) return res.status(403).json({ message: "Unauthorized access" });
//     }

//     const {
//       categoryId,
//       menuName,
//       price,
//       ingredients,
//       isAvailable,
//       status,
//     } = req.body;

//     const imageUrl = req.file?.filename;

//     await db.query(
//       `UPDATE menus SET 
//         categoryId = ?, menuName = ?, price = ?, 
//         ingredients = ?, isAvailable = ?, status = ?, 
//         ${imageUrl ? "imageUrl = ?," : ""} 
//         updated_at = NOW() 
//       WHERE menuId = ?`,
//       imageUrl
//         ? [categoryId, menuName, price, ingredients, isAvailable, status, imageUrl, menuId]
//         : [categoryId, menuName, price, ingredients, isAvailable, status, menuId]
//     );

//     res.status(200).json({ message: "Menu updated successfully" });
//   } catch (err) {
//     console.error("Update menu error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Delete Menu (soft delete)
// const deleteMenu = async (req, res) => {
//   try {
//     const menuId = req.params.id;

//     await db.query("UPDATE menus SET status = 'inactive' WHERE menuId = ?", [menuId]);

//     res.status(200).json({ message: "Menu deleted (soft) successfully" });
//   } catch (err) {
//     console.error("Delete menu error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // ✅ Get Menus by Shop ID (for public users)
// const getMenusByShopId = async (req, res) => {
//   try {
//     const { shopId } = req.params;

//     const [menus] = await db.query(
//       "SELECT * FROM menus WHERE shopId = ? AND status != 'inactive' AND isAvailable = 1",
//       [shopId]
//     );

//     res.status(200).json(menus);
//   } catch (err) {
//     console.error("Get menus by shopId error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getMenusByCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const page = parseInt(req.query.page || "1", 10);
//     const limit = parseInt(req.query.limit || "10", 10);
//     const search = (req.query.search || "").trim();
//     const offset = (page - 1) * limit;

//     // If you use prepared statements (recommended)
//     // Filter menus by categoryId, status & availability
//     const searchFilter = search ? `AND m.menuName LIKE ?` : "";
//     const sql = `
//       SELECT 
//         m.menuId,
//         m.menuName,
//         m.price,
//         m.imageUrl,
//         m.ingredients,
//         m.isAvailable,
//         m.rating
//       FROM menus m
//       WHERE m.status = 'active' 
//         AND m.isAvailable = 1
//         AND m.categoryId = ?
//         ${searchFilter}
//       ORDER BY m.menuName ASC
//       LIMIT ? OFFSET ?
//     `;

//     const params = search
//       ? [parseInt(id, 10), `%${search}%`, limit, offset]
//       : [parseInt(id, 10), limit, offset];

//     const [rows] = await db.query(sql, params);

//     // count total for pagination
//     const countSql = `
//       SELECT COUNT(*) as total 
//       FROM menus m
//       WHERE m.status = 'active' 
//         AND m.isAvailable = 1
//         AND m.categoryId = ?
//         ${search ? `AND m.menuName LIKE ?` : ""}
//     `;
//     const countParams = search
//       ? [parseInt(id, 10), `%${search}%`]
//       : [parseInt(id, 10)];
//     const [countRes] = await db.query(countSql, countParams);
//     const total = countRes[0].total ?? 0;

//     res.status(200).json({
//       page,
//       limit,
//       total,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("getMenusByCategory error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getMenuById = async (req, res) => {
//   try {
//     const menuId = parseInt(req.params.id, 10);
//     if (!Number.isFinite(menuId)) {
//       return res.status(400).json({ message: "Invalid menuId" });
//     }

//     // Query: fetch menu and include category and shop basic info
//     const sql = `
//       SELECT 
//         m.menuId,
//         m.menuName,
//         m.price,
//         m.imageUrl,
//         m.ingredients,
//         m.isAvailable,
//         m.rating,
//         m.status,
//         m.categoryId,
//         c.categoryName,
//         c.categoryImage AS categoryImage,
//         c.shop_id AS categoryShopId,
// s.id AS shopId,
// s.shopname AS shopName,
// s.shopAddress AS shopAddress
//       FROM menus m
//       LEFT JOIN categories c ON m.categoryId = c.categoryId
//       LEFT JOIN shops s ON m.shopId = s.id
//       WHERE m.menuId = ? AND m.status != 'inactive'
//       LIMIT 1
//     `;

//     const [rows] = await db.query(sql, [menuId]);

//     if (!rows || rows.length === 0) {
//       return res.status(404).json({ message: "Menu not found" });
//     }

//     const r = rows[0];

//     // build response object
//     const menu = {
//       menuId: r.menuId,
//       menuName: r.menuName,
//       price: r.price,
//       imageUrl: r.imageUrl,
//       ingredients: r.ingredients,
//       isAvailable: r.isAvailable,
//       rating: r.rating,
//       status: r.status,
//       category: r.categoryId
//         ? {
//             categoryId: r.categoryId,
//             categoryName: r.categoryName,
//             categoryImage: r.categoryImage,
//             shop_id: r.categoryShopId,
//           }
//         : null,
//       shop:
//         r.shopId != null
//           ? {
//               shopId: r.shopId,
//               shopName: r.shopName,
//               shopAddress: r.shopAddress,
//             }
//           : null,
//     };

//     return res.status(200).json({ data: menu });
//   } catch (err) {
//     console.error("getMenuById error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };




// module.exports = {
//   createMenu,
//   getMyMenus,
//   getAllMenus,
//   updateMenu,
//   deleteMenu,
//   getMenusByShopId,
//   getMenusByCategory,
//   getMenuById
// };
// const db = require("../config/db");
// const asyncHandler = require("../middleware/asyncHandler");

// // ✅ Create Menu
// const createMenu = asyncHandler(async (req, res) => {
//   const { categoryId, menuName, price, ingredients, isAvailable, variants } = req.body;
//   const imageUrl = req.file?.filename || null;
//   let shopId = null;

//   if (req.user.role === "shop_owner") {
//     const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
//     if (!shopRows.length) return res.status(404).json({ message: "Shop not found" });
//     shopId = shopRows[0].id;
//   } else if (req.user.role === "admin") {
//     shopId = req.body.shopId;
//     if (!shopId) return res.status(400).json({ message: "shopId is required for admin" });
//   }

//   const [menuResult] = await db.query(
//     `INSERT INTO menus (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable, status, created_at)
//      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
//     [shopId, categoryId, menuName, Number(price), imageUrl, ingredients || null, isAvailable ?? 1]
//   );

//   const menuId = menuResult.insertId;

//   // ✅ Handle variants
//   let parsedVariants = [];
//   if (variants) {
//     try { parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants; } catch {}
//   }
//   if (!parsedVariants.length) parsedVariants = [{ label: "", price: Number(price) }];

//   for (const v of parsedVariants) {
//     await db.query(
//       `INSERT INTO menu_variants (menuId, variantName, price, created_at) VALUES (?, ?, ?, NOW())`,
//       [menuId, v.label || "", Number(v.price || 0)]
//     );
//   }

//   res.status(201).json({ message: "Menu created successfully", menuId });
// });

// // ✅ Other controllers remain same but wrapped in asyncHandler for safety
// const getMyMenus = asyncHandler(async (req, res) => {
//   const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
//   if (!shop.length) return res.status(404).json({ message: "Shop not found" });

//   const [menus] = await db.query("SELECT * FROM menus WHERE shopId = ? AND status='active'", [shop[0].id]);
//   res.json(menus);
// });

// const getAllMenus = asyncHandler(async (req, res) => {
//   const [menus] = await db.query("SELECT * FROM menus WHERE status='active'");
//   res.json(menus);
// });

// const updateMenu = asyncHandler(async (req, res) => {
//   const menuId = req.params.id;
//   const { categoryId, menuName, price, ingredients, isAvailable, status } = req.body;
//   const imageUrl = req.file?.filename;

//   await db.query(
//     `UPDATE menus 
//      SET categoryId=?, menuName=?, price=?, ingredients=?, isAvailable=?, status=?, ${imageUrl ? "imageUrl=?," : ""} updated_at=NOW() 
//      WHERE menuId=?`,
//     imageUrl
//       ? [categoryId, menuName, price, ingredients, isAvailable, status, imageUrl, menuId]
//       : [categoryId, menuName, price, ingredients, isAvailable, status, menuId]
//   );

//   res.json({ message: "Menu updated successfully" });
// });

// const deleteMenu = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   await db.query("UPDATE menus SET status='inactive' WHERE menuId=?", [id]);
//   res.json({ message: "Menu deleted (soft) successfully" });
// });

// const getMenusByShopId = asyncHandler(async (req, res) => {
//   const { shopId } = req.params;
//   const [menus] = await db.query(
//     "SELECT * FROM menus WHERE shopId=? AND status='active' AND isAvailable=1",
//     [shopId]
//   );
//   res.json(menus);
// });

// const getMenusByCategory = asyncHandler(async (req, res) => {
//   const { categoryId } = req.params;
//   const [rows] = await db.query(
//     "SELECT * FROM menus WHERE categoryId=? AND status='active' AND isAvailable=1 ORDER BY menuName ASC",
//     [categoryId]
//   );
//   res.json(rows);
// });

// const getMenuById = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const [rows] = await db.query("SELECT * FROM menus WHERE menuId=? AND status='active'", [id]);
//   if (!rows.length) return res.status(404).json({ message: "Menu not found" });
//   res.json(rows[0]);
// });

// module.exports = {
//   createMenu,
//   getMyMenus,
//   getAllMenus,
//   updateMenu,
//   deleteMenu,
//   getMenusByShopId,
//   getMenusByCategory,
//   getMenuById,
// };
// controllers/menuController.js
const db = require("../config/db"); // assume mysql2/promise pool
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Helper: parse variants safely (string or array)
 * Returns array of { label, price }
 */
function parseVariants(variants, fallbackPrice = 0) {
  let parsed = [];
  if (!variants) {
    return [{ label: "", price: Number(fallbackPrice) }];
  }
  if (typeof variants === "string") {
    try { parsed = JSON.parse(variants); } catch (e) { parsed = []; }
  } else if (Array.isArray(variants)) {
    parsed = variants;
  }
  if (!parsed || parsed.length === 0) {
    return [{ label: "", price: Number(fallbackPrice) }];
  }
  return parsed.map(v => ({ label: v.label ?? "", price: Number(v.price ?? 0) }));
}

/**
 * CREATE MENU
 * Admin: must pass shopId in body
 * Shop owner: inferred from shops.owner_id = req.user.userId
 */
const createMenu = asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      categoryId,
      menuName,
      price = 0,
      ingredients = null,
      isAvailable = 1,
      variants
    } = req.body;

    // basic input guard (routes may already validate)
    if (!menuName || !categoryId) {
      await conn.rollback();
      return res.status(400).json({ message: "menuName and categoryId are required" });
    }

    // Determine shopId
    let shopId = null;
    if (req.user?.role === "shop_owner") {
      const [shopRows] = await conn.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
      if (!shopRows.length) {
        await conn.rollback();
        return res.status(404).json({ message: "Shop not found for this owner" });
      }
      shopId = shopRows[0].id;
    } else if (req.user?.role === "admin") {
      shopId = req.body.shopId ?? null;
      if (!shopId) {
        await conn.rollback();
        return res.status(400).json({ message: "shopId is required for admin" });
      }
    } else {
      // fallback: try to infer by req.user.userId
      const [shopRows] = await conn.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
      if (!shopRows.length) {
        await conn.rollback();
        return res.status(404).json({ message: "Shop not found" });
      }
      shopId = shopRows[0].id;
    }

    // Optionally: ensure category exists (and belongs to shop if you require)
    const [catRows] = await conn.query("SELECT categoryId, shop_id FROM categories WHERE categoryId = ?", [categoryId]);
    if (!catRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Category not found" });
    }
    // Optional: if category is tied to a shop and you want to ensure it belongs to same shop:
    // if (catRows[0].shop_id && Number(catRows[0].shop_id) !== Number(shopId)) { ... }

    const imageUrl = req.file?.filename ?? null;

    const [insertResult] = await conn.query(
      `INSERT INTO menus
        (shopId, categoryId, menuName, price, imageUrl, ingredients, isAvailable, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [shopId, categoryId, menuName, Number(price), imageUrl, ingredients || null, Number(isAvailable ?? 1)]
    );

    const menuId = insertResult.insertId;

    // handle variants
    const parsedVariants = parseVariants(variants, price);
    for (const v of parsedVariants) {
      await conn.query(
        `INSERT INTO menu_variants (menuId, variantName, price, created_at) VALUES (?, ?, ?, NOW())`,
        [menuId, v.label ?? "", Number(v.price ?? 0)]
      );
    }

    await conn.commit();
    return res.status(201).json({ message: "Menu created successfully", menuId });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("Create menu error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

/**
 * GET MY MENUS (for shop_owner)
 */
const getMyMenus = asyncHandler(async (req, res) => {
  // Find shop id by owner
  const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
  if (!shopRows.length) return res.status(404).json({ message: "Shop not found" });

  const shopId = shopRows[0].id;
  const [menus] = await db.query("SELECT * FROM menus WHERE shopId = ? AND status = 'active' ORDER BY created_at DESC", [shopId]);
  res.json(menus);
});

/**
 * GET ALL MENUS (admin)
 */
const getAllMenus = asyncHandler(async (req, res) => {
  const [menus] = await db.query("SELECT * FROM menus WHERE status = 'active' ORDER BY created_at DESC");
  res.json(menus);
});

/**
 * UPDATE MENU
 * - shop_owner can only update menus belonging to their shop
 * - admin can update any (optionally pass shopId if changing ownership)
 * - supports replacing variants if variants provided (transactional)
 */
const updateMenu = asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const menuId = Number(req.params.id);
    if (!Number.isFinite(menuId)) {
      await conn.rollback();
      return res.status(400).json({ message: "Invalid menu id" });
    }

    // ensure menu exists & ownership
    const [menuRows] = await conn.query("SELECT * FROM menus WHERE menuId = ?", [menuId]);
    if (!menuRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: "Menu not found" });
    }
    const menu = menuRows[0];

    if (req.user.role === "shop_owner") {
      // verify ownership
      const [shopRows] = await conn.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
      if (!shopRows.length) { await conn.rollback(); return res.status(404).json({ message: "Shop not found" }); }
      const shopId = shopRows[0].id;
      if (Number(menu.shopId) !== Number(shopId)) {
        await conn.rollback();
        return res.status(403).json({ message: "Unauthorized access" });
      }
    }

    // prepare update values
    const {
      categoryId = menu.categoryId,
      menuName = menu.menuName,
      price = menu.price,
      ingredients = menu.ingredients,
      isAvailable = menu.isAvailable,
      status = menu.status,
      variants
    } = req.body;

    const imageUrl = req.file?.filename ?? null;

    // Build dynamic query to optionally set imageUrl
    if (imageUrl) {
      await conn.query(
        `UPDATE menus SET categoryId=?, menuName=?, price=?, ingredients=?, isAvailable=?, status=?, imageUrl=?, updated_at=NOW() WHERE menuId=?`,
        [categoryId, menuName, Number(price), ingredients ?? null, Number(isAvailable ?? 1), status ?? 'active', imageUrl, menuId]
      );
    } else {
      await conn.query(
        `UPDATE menus SET categoryId=?, menuName=?, price=?, ingredients=?, isAvailable=?, status=?, updated_at=NOW() WHERE menuId=?`,
        [categoryId, menuName, Number(price), ingredients ?? null, Number(isAvailable ?? 1), status ?? 'active', menuId]
      );
    }

    // If variants provided, replace them (delete existing -> insert new)
    if (typeof variants !== "undefined") {
      // remove old variants
      await conn.query("DELETE FROM menu_variants WHERE menuId = ?", [menuId]);
      const parsedVariants = parseVariants(variants, price);
      for (const v of parsedVariants) {
        await conn.query("INSERT INTO menu_variants (menuId, variantName, price, created_at) VALUES (?, ?, ?, NOW())", [menuId, v.label ?? "", Number(v.price ?? 0)]);
      }
    }

    await conn.commit();
    res.json({ message: "Menu updated successfully" });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("Update menu error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
});

/**
 * SOFT DELETE MENU
 */
const deleteMenu = asyncHandler(async (req, res) => {
  const menuId = Number(req.params.id);
  if (!Number.isFinite(menuId)) return res.status(400).json({ message: "Invalid menu id" });

  // if shop_owner, ensure menu belongs to their shop
  if (req.user.role === "shop_owner") {
    const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
    if (!shopRows.length) return res.status(404).json({ message: "Shop not found" });
    const shopId = shopRows[0].id;

    const [menuRows] = await db.query("SELECT * FROM menus WHERE menuId = ? AND shopId = ?", [menuId, shopId]);
    if (!menuRows.length) return res.status(403).json({ message: "No permission to delete this menu" });
  }

  await db.query("UPDATE menus SET status = 'inactive', updated_at = NOW() WHERE menuId = ?", [menuId]);
  res.json({ message: "Menu deleted (soft) successfully" });
});

/**
 * PUBLIC: menus by shopId (only active + available)
 */
const getMenusByShopId = asyncHandler(async (req, res) => {
  const shopId = Number(req.params.shopId);
  if (!Number.isFinite(shopId)) return res.status(400).json({ message: "Invalid shop id" });

  const [menus] = await db.query(
    "SELECT menuId, menuName, price, imageUrl, ingredients, isAvailable, rating FROM menus WHERE shopId = ? AND status = 'active' AND isAvailable = 1 ORDER BY menuName ASC",
    [shopId]
  );
  res.json(menus);
});

/**
 * GET MENUS BY CATEGORY (paginated + search)
 * route param: categoryId
 */
const getMenusByCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.categoryId ?? req.params.id); // support either param name
  if (!Number.isFinite(categoryId)) return res.status(400).json({ message: "Invalid category id" });

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const offset = (Math.max(1, page) - 1) * Math.max(1, limit);
  const search = (req.query.search || "").trim();

  const searchFilter = search ? `AND m.menuName LIKE ?` : "";
  const params = search ? [categoryId, `%${search}%`, limit, offset] : [categoryId, limit, offset];

  const sql = `
    SELECT m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable, m.rating
    FROM menus m
    WHERE m.status = 'active' AND m.isAvailable = 1 AND m.categoryId = ?
    ${searchFilter}
    ORDER BY m.menuName ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, params);

  // total count
  const countSql = search
    ? "SELECT COUNT(*) as total FROM menus m WHERE m.status='active' AND m.isAvailable=1 AND m.categoryId = ? AND m.menuName LIKE ?"
    : "SELECT COUNT(*) as total FROM menus m WHERE m.status='active' AND m.isAvailable=1 AND m.categoryId = ?";
  const countParams = search ? [categoryId, `%${search}%`] : [categoryId];
  const [countRes] = await db.query(countSql, countParams);

  res.json({
    page: Number(page),
    limit: Number(limit),
    total: Number(countRes[0]?.total ?? 0),
    data: rows
  });
});

/**
 * GET single menu detail (joins category + shop info)
 */
const getMenuById = asyncHandler(async (req, res) => {
  const menuId = Number(req.params.id);
  if (!Number.isFinite(menuId)) return res.status(400).json({ message: "Invalid menu id" });

  const sql = `
    SELECT 
      m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable, m.rating, m.status, m.categoryId,
      c.categoryName, c.categoryImage, c.shop_id AS categoryShopId,
      s.id AS shopId, s.shopname AS shopName, s.shopAddress AS shopAddress
    FROM menus m
    LEFT JOIN categories c ON m.categoryId = c.categoryId
    LEFT JOIN shops s ON m.shopId = s.id
    WHERE m.menuId = ? AND m.status != 'inactive'
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [menuId]);
  if (!rows.length) return res.status(404).json({ message: "Menu not found" });

  const r = rows[0];
  const menu = {
    menuId: r.menuId,
    menuName: r.menuName,
    price: r.price,
    imageUrl: r.imageUrl,
    ingredients: r.ingredients,
    isAvailable: r.isAvailable,
    rating: r.rating,
    status: r.status,
    category: r.categoryId ? {
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      categoryImage: r.categoryImage,
      shop_id: r.categoryShopId,
    } : null,
    shop: r.shopId ? {
      shopId: r.shopId,
      shopName: r.shopName,
      shopAddress: r.shopAddress,
    } : null
  };

  res.json({ data: menu });
});

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
