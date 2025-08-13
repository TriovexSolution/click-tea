const db = require("../config/db");

// ✅ Create Category (admin or shop_owner)
// const createCategory = async (req, res) => {
//   try {
//     const { categoryName } = req.body;

//     if (!categoryName) {
//       return res.status(400).json({ message: "Category name is required" });
//     }

//     const categoryImage = req.file?.filename || null;
//     const shop_id = req.user.role === "shop_owner" ? req.user.id : null;

//     // Prevent duplicate category name for same shop
//     const [existing] = await db.query(
//       "SELECT * FROM categories WHERE categoryName = ? AND shop_id <=> ?",
//       [categoryName, shop_id]
//     );
//     if (existing.length > 0) {
//       return res.status(409).json({ message: "Category already exists" });
//     }

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
const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const categoryImage = req.file?.filename || null;

    let shop_id = null;

    if (req.user.role === "shop_owner") {
      // 🔍 Get the shop ID using the logged-in user (owner)
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);

      if (!shop.length) {
        return res.status(404).json({ message: "Shop not found for this owner" });
      }

      shop_id = shop[0].id;
    }

    // ✅ Check for duplicate category for this shop
    const [existing] = await db.query(
      "SELECT * FROM categories WHERE categoryName = ? AND shop_id <=> ?",
      [categoryName, shop_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // ✅ Insert the category
    await db.query(
      `INSERT INTO categories (categoryName, categoryImage, shop_id, status) VALUES (?, ?, ?, 'active')`,
      [categoryName, categoryImage, shop_id]
    );

    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get All Categories (admin)
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
    res.status(200).json(categories);
  } catch (err) {
    console.error("Get all categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get My Categories (shop_owner)
// const getMyCategories = async (req, res) => {
//   try {
//     const [categories] = await db.query(
//       "SELECT * FROM categories WHERE shop_id = ? AND status = 'active' ORDER BY created_at DESC",
//       [req.user.id]
//     );
//     res.status(200).json(categories);
//   } catch (err) {
//     console.error("Get my categories error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const getMyCategories = async (req, res) => {
  try {
    const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [req.user.id]);

    if (!shop.length) {
      return res.status(404).json({ message: "Shop not found for this user" });
    }

    const shopId = shop[0].id;

    const [categories] = await db.query(
      "SELECT categoryId AS id, categoryName , categoryImage FROM categories WHERE shop_id = ? AND status = 'active' ORDER BY created_at DESC",
      [shopId]
    );

    res.status(200).json(categories);
  } catch (err) {
    console.error("Get my categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ Update Category (shop_owner or admin)
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { categoryName } = req.body;
    const categoryImage = req.file?.filename || null;

    // Check ownership for shop_owner
    if (req.user.role === "shop_owner") {
      const [rows] = await db.query("SELECT * FROM categories WHERE id = ? AND shop_id = ?", [
        categoryId,
        req.user.id,
      ]);
      if (rows.length === 0) {
        return res.status(403).json({ message: "You don't have permission to update this category" });
      }
    }

    // Update
    await db.query(
      `UPDATE categories SET categoryName = ?, categoryImage = ?, updated_at = NOW() WHERE id = ?`,
      [categoryName, categoryImage, categoryId]
    );

    res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Soft Delete Category (admin or shop_owner)
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check ownership for shop_owner
    if (req.user.role === "shop_owner") {
      const [rows] = await db.query("SELECT * FROM categories WHERE id = ? AND shop_id = ?", [
        categoryId,
        req.user.id,
      ]);
      if (rows.length === 0) {
        return res.status(403).json({ message: "You don't have permission to delete this category" });
      }
    }

    await db.query("UPDATE categories SET status = 'inactive', updated_at = NOW() WHERE id = ?", [
      categoryId,
    ]);

    res.status(200).json({ message: "Category deleted successfully (soft deleted)" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getPublicCategoriesByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const [categories] = await db.query(
      // "SELECT id, name FROM categories WHERE shopId = ? AND status = 'active'",
      "SELECT * FROM categories WHERE shop_id = ? AND status = 'active'",
      [shopId]
    );

    res.status(200).json(categories);
  } catch (error) {
    console.error("Get public categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getCategoriesWithMenus = async (req, res) => {
  try {
    // Extract query params for pagination and search
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    // Prepare search filter SQL snippet
    const searchFilter = search ? `AND c.categoryName LIKE ?` : "";

    // Build SQL with LIMIT and OFFSET for pagination
    const sql = `
      SELECT 
        c.categoryId, 
        c.categoryName, 
        c.categoryImage,
        c.shop_id,
        c.is_global,
        m.menuId,
        m.menuName,
        m.price,
        m.imageUrl,
        m.ingredients,
        m.isAvailable,
        m.rating
      FROM categories c
      LEFT JOIN menus m 
        ON c.categoryId = m.categoryId 
        AND m.status = 'active' 
        AND m.isAvailable = 1
      WHERE c.status = 'active' 
        ${searchFilter}
      ORDER BY c.created_at DESC, m.menuName ASC
      LIMIT ? OFFSET ?
    `;

    // Build parameters array for prepared statement
    const params = search ? [`%${search}%`, parseInt(limit), parseInt(offset)] : [parseInt(limit), parseInt(offset)];

    const [rows] = await db.query(sql, params);

    // Group menus under categories
    const categoriesMap = {};

    rows.forEach(row => {
      if (!categoriesMap[row.categoryId]) {
        categoriesMap[row.categoryId] = {
          categoryId: row.categoryId,
          categoryName: row.categoryName,
          categoryImage: row.categoryImage,
          shop_id: row.shop_id,
          is_global: row.is_global,
          menus: [],
        };
      }
      if (row.menuId) {
        categoriesMap[row.categoryId].menus.push({
          menuId: row.menuId,
          menuName: row.menuName,
          price: row.price,
          imageUrl: row.imageUrl,
          ingredients: row.ingredients,
          isAvailable: row.isAvailable,
          rating: row.rating,
        });
      }
    });

    const categoriesWithMenus = Object.values(categoriesMap);

    // Optional: Total count for pagination info
    let totalCount = 0;
    if (page == 1) {
      // Count total categories matching search
      const countSql = `SELECT COUNT(*) AS count FROM categories c WHERE c.status = 'active' ${searchFilter}`;
      const [countResult] = await db.query(countSql, search ? [`%${search}%`] : []);
      totalCount = countResult[0].count;
    }

    res.status(200).json({
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
      data: categoriesWithMenus,
    });
  } catch (error) {
    console.error("Error fetching categories with menus:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createCategory,
  getAllCategories,
  getMyCategories,
  updateCategory,
  deleteCategory,
  getPublicCategoriesByShop,
  getCategoriesWithMenus
};
