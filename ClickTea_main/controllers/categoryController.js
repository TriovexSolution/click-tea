// const db = require("../config/db");
// const toInt = (v, fallback = 1) => {
//   const n = parseInt(v, 10);
//   return Number.isFinite(n) ? n : fallback;
// };

// const createCategory = async (req, res) => {
//   try {
//     const { categoryName } = req.body;

//     if (!categoryName) {
//       return res.status(400).json({ message: "Category name is required" });
//     }

//     const categoryImage = req.file?.filename || null;

//     let shop_id = null;

//   //  console.log("[createCategory] req.user:", req.user);

// if (req.user.role === "shop_owner") {
//   const ownerId = req.user.userId ?? req.user.userId;
//   if (!ownerId) {
//     return res.status(401).json({ message: "Unauthorized: owner id missing" });
//   }
//   const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [ownerId]);
//   if (!shop.length) {
//     return res.status(404).json({ message: "Shop not found for this owner" });
//   }
//   shop_id = shop[0].id;
// }


//     // ✅ Check for duplicate category for this shop
//     const [existing] = await db.query(
//       "SELECT * FROM categories WHERE categoryName = ? AND shop_id <=> ?",
//       [categoryName, shop_id]
//     );

//     if (existing.length > 0) {
//       return res.status(409).json({ message: "Category already exists" });
//     }

//     // ✅ Insert the category
//     await db.query(
//       `INSERT INTO categories (categoryName, categoryImage, shop_id, status) VALUES (?, ?, ?, 'active')`,
//       [categoryName, categoryImage, shop_id]
//     );

//     res.status(201).json({ message: "Category created successfully" });
//   } catch (err) {
//     console.error("Create category error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Get All Categories (admin)
// const getAllCategories = async (req, res) => {
//   try {
//     const [categories] = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
//     res.status(200).json(categories);
//   } catch (err) {
//     console.error("Get all categories error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getMyCategories = async (req, res) => {
//   try {
//     const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);

//     if (!shop.length) {
//       return res.status(404).json({ message: "Shop not found for this user" });
//     }

//     const shopId = shop[0].id;

//     const [categories] = await db.query(
//       "SELECT categoryId AS id, categoryName , categoryImage FROM categories WHERE shop_id = ? AND status = 'active' ORDER BY created_at DESC",
//       [shopId]
//     );

//     res.status(200).json(categories);
//   } catch (err) {
//     console.error("Get my categories error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// // ✅ Update Category (shop_owner or admin)
// const updateCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.id;
//     const { categoryName } = req.body;
//     const categoryImage = req.file?.filename || null;

//     // Check ownership for shop_owner
//     if (req.user.role === "shop_owner") {
//       const [rows] = await db.query("SELECT * FROM categories WHERE id = ? AND shop_id = ?", [
//         categoryId,
//         req.user.id,
//       ]);
//       if (rows.length === 0) {
//         return res.status(403).json({ message: "You don't have permission to update this category" });
//       }
//     }

//     // Update
//     await db.query(
//       `UPDATE categories SET categoryName = ?, categoryImage = ?, updated_at = NOW() WHERE id = ?`,
//       [categoryName, categoryImage, categoryId]
//     );

//     res.status(200).json({ message: "Category updated successfully" });
//   } catch (err) {
//     console.error("Update category error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ Soft Delete Category (admin or shop_owner)
// const deleteCategory = async (req, res) => {
//   try {
//     const categoryId = req.params.id;

//     // Check ownership for shop_owner
//     if (req.user.role === "shop_owner") {
//       const [rows] = await db.query("SELECT * FROM categories WHERE id = ? AND shop_id = ?", [
//         categoryId,
//         req.user.id,
//       ]);
//       if (rows.length === 0) {
//         return res.status(403).json({ message: "You don't have permission to delete this category" });
//       }
//     }

//     await db.query("UPDATE categories SET status = 'inactive', updated_at = NOW() WHERE id = ?", [
//       categoryId,
//     ]);

//     res.status(200).json({ message: "Category deleted successfully (soft deleted)" });
//   } catch (err) {
//     console.error("Delete category error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getPublicCategoriesByShop = async (req, res) => {
//   try {
//     const { shopId } = req.params;

//     const [categories] = await db.query(
//       // "SELECT id, name FROM categories WHERE shopId = ? AND status = 'active'",
//       "SELECT * FROM categories WHERE shop_id = ? AND status = 'active'",
//       [shopId]
//     );

//     res.status(200).json(categories);
//   } catch (error) {
//     console.error("Get public categories error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getCategoriesWithMenus = async (req, res) => {
//   try {
//     const page = toInt(req.query.page, 1);
//     const limit = toInt(req.query.limit, 10);
//     const search = (req.query.search || "").trim();
//     const offset = (page - 1) * limit;

//     const searchFilter = search ? `AND c.categoryName LIKE ?` : "";

//     const sql = `
//       SELECT 
//         c.categoryId, 
//         c.categoryName, 
//         c.categoryImage,
//         c.shop_id,
//         c.is_global,
//         m.menuId,
//         m.menuName,
//         m.price,
//         m.imageUrl,
//         m.ingredients,
//         m.isAvailable,
//         m.rating
//       FROM categories c
//       LEFT JOIN menus m 
//         ON c.categoryId = m.categoryId 
//         AND m.status = 'active' 
//         AND m.isAvailable = 1
//       WHERE c.status = 'active'
//         ${searchFilter}
//       ORDER BY c.created_at DESC, m.menuName ASC
//       LIMIT ? OFFSET ?
//     `;

//     const params = search ? [`%${search}%`, limit, offset] : [limit, offset];
//     const [rows] = await db.query(sql, params);

//     // group menus under categories
//     const categoriesMap = {};
//     rows.forEach(row => {
//       if (!categoriesMap[row.categoryId]) {
//         categoriesMap[row.categoryId] = {
//           categoryId: row.categoryId,
//           categoryName: row.categoryName,
//           categoryImage: row.categoryImage,
//           shop_id: row.shop_id,
//           is_global: row.is_global,
//           menus: [],
//         };
//       }
//       if (row.menuId) {
//         categoriesMap[row.categoryId].menus.push({
//           menuId: row.menuId,
//           menuName: row.menuName,
//           price: row.price,
//           imageUrl: row.imageUrl,
//           ingredients: row.ingredients,
//           isAvailable: row.isAvailable,
//           rating: row.rating,
//         });
//       }
//     });

//     const categoriesWithMenus = Object.values(categoriesMap);

//     // optional total count (only reliable for first page)
//     let totalCount = 0;
//     if (page === 1) {
//       const countSql = `SELECT COUNT(*) AS count FROM categories c WHERE c.status = 'active' ${searchFilter}`;
//       const [countResult] = await db.query(countSql, search ? [`%${search}%`] : []);
//       totalCount = countResult[0]?.count ?? 0;
//     }

//     res.status(200).json({
//       page,
//       limit,
//       totalCount,
//       data: categoriesWithMenus,
//     });
//   } catch (error) {
//     console.error("Error fetching categories with menus:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getMenusByCategory  = async (req, res) => {
//   try {
//     // Extract query params for pagination and search
//     const { page = 1, limit = 10, search = "" } = req.query;
//     const offset = (page - 1) * limit;

//     // Prepare search filter SQL snippet
//     const searchFilter = search ? `AND c.categoryName LIKE ?` : "";

//     // Build SQL with LIMIT and OFFSET for pagination
//     const sql = `
//       SELECT 
//         c.categoryId, 
//         c.categoryName, 
//         c.categoryImage,
//         c.shop_id,
//         c.is_global,
//         m.menuId,
//         m.menuName,
//         m.price,
//         m.imageUrl,
//         m.ingredients,
//         m.isAvailable,
//         m.rating
//       FROM categories c
//       LEFT JOIN menus m 
//         ON c.categoryId = m.categoryId 
//         AND m.status = 'active' 
//         AND m.isAvailable = 1
//       WHERE c.status = 'active' 
//         ${searchFilter}
//       ORDER BY c.created_at DESC, m.menuName ASC
//       LIMIT ? OFFSET ?
//     `;

//     // Build parameters array for prepared statement
//     const params = search ? [`%${search}%`, parseInt(limit), parseInt(offset)] : [parseInt(limit), parseInt(offset)];

//     const [rows] = await db.query(sql, params);

//     // Group menus under categories
//     const categoriesMap = {};

//     rows.forEach(row => {
//       if (!categoriesMap[row.categoryId]) {
//         categoriesMap[row.categoryId] = {
//           categoryId: row.categoryId,
//           categoryName: row.categoryName,
//           categoryImage: row.categoryImage,
//           shop_id: row.shop_id,
//           is_global: row.is_global,
//           menus: [],
//         };
//       }
//       if (row.menuId) {
//         categoriesMap[row.categoryId].menus.push({
//           menuId: row.menuId,
//           menuName: row.menuName,
//           price: row.price,
//           imageUrl: row.imageUrl,
//           ingredients: row.ingredients,
//           isAvailable: row.isAvailable,
//           rating: row.rating,
//         });
//       }
//     });

//     const categoriesWithMenus = Object.values(categoriesMap);

//     // Optional: Total count for pagination info
//     let totalCount = 0;
//     if (page == 1) {
//       // Count total categories matching search
//       const countSql = `SELECT COUNT(*) AS count FROM categories c WHERE c.status = 'active' ${searchFilter}`;
//       const [countResult] = await db.query(countSql, search ? [`%${search}%`] : []);
//       totalCount = countResult[0].count;
//     }

//     res.status(200).json({
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalCount,
//       data: categoriesWithMenus,
//     });
//   } catch (error) {
//     console.error("Error fetching categories with menus:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// module.exports = {
//   createCategory,
//   getAllCategories,
//   getMyCategories,
//   updateCategory,
//   deleteCategory,
//   getPublicCategoriesByShop,
//   getCategoriesWithMenus,
//   getMenusByCategory
// };
// const db = require("../config/db");
// const asyncHandler = require("../middleware/asyncHandler");

// // Utility
// const toInt = (v, fallback = 1) => {
//   const n = parseInt(v, 10);
//   return Number.isFinite(n) ? n : fallback;
// };

// // ✅ Create Category
// const createCategory = asyncHandler(async (req, res) => {
//   const { categoryName } = req.body;
//   if (!categoryName) return res.status(400).json({ message: "Category name is required" });

//   const categoryImage = req.file?.filename || null;
//   let shop_id = null;

//   if (req.user.role === "shop_owner") {
//     const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
//     if (!shop.length) return res.status(404).json({ message: "Shop not found for this owner" });
//     shop_id = shop[0].id;
//   } else if (req.user.role === "admin") {
//     shop_id = req.body.shop_id ?? null;
//   }

//   const [existing] = await db.query(
//     "SELECT id FROM categories WHERE categoryName = ? AND shop_id <=> ?",
//     [categoryName, shop_id]
//   );
//   if (existing.length) return res.status(409).json({ message: "Category already exists" });

//   await db.query(
//     "INSERT INTO categories (categoryName, categoryImage, shop_id, status, created_at) VALUES (?, ?, ?, 'active', NOW())",
//     [categoryName, categoryImage, shop_id]
//   );

//   res.status(201).json({ message: "Category created successfully" });
// });

// // ✅ Get All Categories (Admin)
// const getAllCategories = asyncHandler(async (req, res) => {
//   const [categories] = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
//   res.json(categories);
// });

// // ✅ Get My Categories (Shop Owner)
// const getMyCategories = asyncHandler(async (req, res) => {
//   const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
//   if (!shop.length) return res.status(404).json({ message: "Shop not found" });

//   const [categories] = await db.query(
//     "SELECT id, categoryName, categoryImage FROM categories WHERE shop_id = ? AND status='active' ORDER BY created_at DESC",
//     [shop[0].id]
//   );
//   res.json(categories);
// });

// // ✅ Update Category
// const updateCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { categoryName } = req.body;
//   const categoryImage = req.file?.filename || null;

//   if (req.user.role === "shop_owner") {
//     const [rows] = await db.query(
//       "SELECT id FROM categories WHERE id=? AND shop_id IN (SELECT id FROM shops WHERE owner_id=?)",
//       [id, req.user.userId]
//     );
//     if (!rows.length) return res.status(403).json({ message: "No permission to update this category" });
//   }

//   await db.query(
//     "UPDATE categories SET categoryName=?, categoryImage=?, updated_at=NOW() WHERE id=?",
//     [categoryName, categoryImage, id]
//   );

//   res.json({ message: "Category updated successfully" });
// });

// // ✅ Soft Delete
// const deleteCategory = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (req.user.role === "shop_owner") {
//     const [rows] = await db.query(
//       "SELECT id FROM categories WHERE id=? AND shop_id IN (SELECT id FROM shops WHERE owner_id=?)",
//       [id, req.user.userId]
//     );
//     if (!rows.length) return res.status(403).json({ message: "No permission to delete this category" });
//   }

//   await db.query("UPDATE categories SET status='inactive', updated_at=NOW() WHERE id=?", [id]);
//   res.json({ message: "Category deleted successfully (soft)" });
// });

// // ✅ Public Categories by Shop
// const getPublicCategoriesByShop = asyncHandler(async (req, res) => {
//   const { shopId } = req.params;
//   const [categories] = await db.query(
//     "SELECT * FROM categories WHERE shop_id=? AND status='active'",
//     [shopId]
//   );
//   res.json(categories);
// });

// // ✅ Categories with Menus (Paginated + Search)
// const getCategoriesWithMenus = asyncHandler(async (req, res) => {
//   const page = toInt(req.query.page, 1);
//   const limit = toInt(req.query.limit, 10);
//   const search = (req.query.search || "").trim();
//   const offset = (page - 1) * limit;
//   const searchFilter = search ? `AND c.categoryName LIKE ?` : "";

//   const sql = `
//     SELECT 
//       c.id AS categoryId, c.categoryName, c.categoryImage, c.shop_id,
//       m.id AS menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable
//     FROM categories c
//     LEFT JOIN menus m ON c.id = m.categoryId AND m.status='active' AND m.isAvailable=1
//     WHERE c.status='active' ${searchFilter}
//     ORDER BY c.created_at DESC, m.menuName ASC
//     LIMIT ? OFFSET ?;
//   `;

//   const params = search ? [`%${search}%`, limit, offset] : [limit, offset];
//   const [rows] = await db.query(sql, params);

//   // Group by category
//   const categoriesMap = {};
//   rows.forEach(r => {
//     if (!categoriesMap[r.categoryId]) {
//       categoriesMap[r.categoryId] = {
//         id: r.categoryId,
//         categoryName: r.categoryName,
//         categoryImage: r.categoryImage,
//         shop_id: r.shop_id,
//         menus: [],
//       };
//     }
//     if (r.menuId) {
//       categoriesMap[r.categoryId].menus.push({
//         id: r.menuId,
//         menuName: r.menuName,
//         price: r.price,
//         imageUrl: r.imageUrl,
//         ingredients: r.ingredients,
//         isAvailable: r.isAvailable,
//       });
//     }
//   });

//   res.json({ page, limit, data: Object.values(categoriesMap) });
// });

// module.exports = {
//   createCategory,
//   getAllCategories,
//   getMyCategories,
//   updateCategory,
//   deleteCategory,
//   getPublicCategoriesByShop,
//   getCategoriesWithMenus,
// };
// controllers/categoryController.js
const db = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

const toInt = (v, fallback = 1) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

// CREATE
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName } = req.body;
  if (!categoryName) return res.status(400).json({ message: "categoryName is required" });

  const categoryImage = req.file?.filename || null;
  let shop_id = null;

  if (req.user.role === "shop_owner") {
    const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
    if (!shopRows.length) return res.status(404).json({ message: "Shop not found for this owner" });
    shop_id = shopRows[0].id;
  } else if (req.user.role === "admin") {
    // admin may provide shop_id (optional)
    shop_id = req.body.shop_id ?? null;
  }

  const [existing] = await db.query(
    "SELECT categoryId FROM categories WHERE categoryName = ? AND shop_id <=> ?",
    [categoryName, shop_id]
  );
  if (existing.length) return res.status(409).json({ message: "Category already exists" });

  await db.query(
    "INSERT INTO categories (categoryName, categoryImage, shop_id, status, created_at) VALUES (?, ?, ?, 'active', NOW())",
    [categoryName, categoryImage, shop_id]
  );

  res.status(201).json({ message: "Category created successfully" });
});

// GET ALL (admin)
const getAllCategories = asyncHandler(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
  res.json(rows);
});

// GET MY CATEGORIES (shop_owner)
const getMyCategories = asyncHandler(async (req, res) => {
  const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.userId]);
  if (!shopRows.length) return res.status(404).json({ message: "Shop not found" });

  const shopId = shopRows[0].id;
  const [rows] = await db.query(
    "SELECT categoryId, categoryName, categoryImage FROM categories WHERE shop_id = ? AND status = 'active' ORDER BY created_at DESC",
    [shopId]
  );
  res.json(rows);
});

// UPDATE
const updateCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  if (!Number.isFinite(categoryId)) return res.status(400).json({ message: "Invalid category id" });

  const { categoryName } = req.body;
  const categoryImage = req.file?.filename || null;

  if (req.user.role === "shop_owner") {
    const [rows] = await db.query(
      "SELECT categoryId FROM categories WHERE categoryId = ? AND shop_id IN (SELECT id FROM shops WHERE owner_id = ?)",
      [categoryId, req.user.userId]
    );
    if (!rows.length) return res.status(403).json({ message: "No permission to update this category" });
  }

  await db.query("UPDATE categories SET categoryName = ?, categoryImage = ?, updated_at = NOW() WHERE categoryId = ?", [categoryName, categoryImage, categoryId]);
  res.json({ message: "Category updated successfully" });
});

// SOFT DELETE
const deleteCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  if (!Number.isFinite(categoryId)) return res.status(400).json({ message: "Invalid category id" });

  if (req.user.role === "shop_owner") {
    const [rows] = await db.query(
      "SELECT categoryId FROM categories WHERE categoryId = ? AND shop_id IN (SELECT id FROM shops WHERE owner_id = ?)",
      [categoryId, req.user.userId]
    );
    if (!rows.length) return res.status(403).json({ message: "No permission to delete this category" });
  }

  await db.query("UPDATE categories SET status = 'inactive', updated_at = NOW() WHERE categoryId = ?", [categoryId]);
  res.json({ message: "Category deleted successfully (soft)" });
});

// PUBLIC categories by shop
const getPublicCategoriesByShop = asyncHandler(async (req, res) => {
  const shopId = Number(req.params.shopId);
  if (!Number.isFinite(shopId)) return res.status(400).json({ message: "Invalid shop id" });

  const [rows] = await db.query("SELECT categoryId, categoryName, categoryImage FROM categories WHERE shop_id = ? AND status = 'active' ORDER BY created_at DESC", [shopId]);
  res.json(rows);
});

// categories-with-menus (paginated + search)
const getCategoriesWithMenus = asyncHandler(async (req, res) => {
  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 10);
  const search = (req.query.search || "").trim();
  const offset = (page - 1) * limit;
  const searchFilter = search ? `AND c.categoryName LIKE ?` : "";

  const sql = `
    SELECT c.categoryId, c.categoryName, c.categoryImage, c.shop_id,
           m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable
    FROM categories c
    LEFT JOIN menus m ON c.categoryId = m.categoryId AND m.status = 'active' AND m.isAvailable = 1
    WHERE c.status = 'active' ${searchFilter}
    ORDER BY c.created_at DESC, m.menuName ASC
    LIMIT ? OFFSET ?
  `;
  const params = search ? [`%${search}%`, limit, offset] : [limit, offset];
  const [rows] = await db.query(sql, params);

  const map = {};
  rows.forEach(r => {
    if (!map[r.categoryId]) {
      map[r.categoryId] = { categoryId: r.categoryId, categoryName: r.categoryName, categoryImage: r.categoryImage, shop_id: r.shop_id, menus: [] };
    }
    if (r.menuId) {
      map[r.categoryId].menus.push({
        menuId: r.menuId, menuName: r.menuName, price: r.price, imageUrl: r.imageUrl, ingredients: r.ingredients, isAvailable: r.isAvailable
      });
    }
  });

  res.json({ page, limit, data: Object.values(map) });
});
const getMenusByCategory = asyncHandler(async (req, res) => {
  const categoryId = Number(req.params.id);
  if (!Number.isFinite(categoryId)) return res.status(400).json({ message: "Invalid category id" });

  const page = toInt(req.query.page, 1);
  const limit = Math.min(toInt(req.query.limit, 10), 100);
  const search = (req.query.search || "").trim();
  const offset = (page - 1) * limit;

  // Verify category exists and is active (optional but recommended)
  const [catRows] = await db.query("SELECT categoryId FROM categories WHERE categoryId = ? AND status = 'active'", [categoryId]);
  if (!catRows.length) return res.status(404).json({ message: "Category not found" });

  // Build SQL and params
  let sql = `
    SELECT m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable, m.rating
    FROM menus m
    WHERE m.categoryId = ? AND m.status = 'active' AND m.isAvailable = 1
  `;
  const params = [categoryId];

  if (search) {
    sql += " AND m.menuName LIKE ? ";
    params.push(`%${search}%`);
  }

  sql += " ORDER BY m.menuName ASC LIMIT ? OFFSET ? ";
  params.push(limit, offset);

  const [rows] = await db.query(sql, params);

  // total count (for pagination)
  let total = null;
  try {
    const countSql = `SELECT COUNT(*) as total FROM menus m WHERE m.categoryId = ? AND m.status = 'active' AND m.isAvailable = 1 ${search ? "AND m.menuName LIKE ?" : ""}`;
    const countParams = search ? [categoryId, `%${search}%`] : [categoryId];
    const [countRes] = await db.query(countSql, countParams);
    total = Number(countRes[0]?.total ?? 0);
  } catch (e) {
    total = null; // fallback — not critical
  }

  res.json({
    page,
    limit,
    total,
    data: rows,
  });
});
module.exports = {
  createCategory,
  getAllCategories,
  getMyCategories,
  updateCategory,
  deleteCategory,
  getPublicCategoriesByShop,
  getCategoriesWithMenus,
  getMenusByCategory
};
