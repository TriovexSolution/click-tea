// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getMyCategories,
  updateCategory,
  deleteCategory,
  getPublicCategoriesByShop,
  getCategoriesWithMenus,
  getMenusByCategory,
} = require("../controllers/categoryController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Create - admin/shop_owner
router.post("/create", verifyToken, authorizeRoles("admin", "shop_owner"), upload.single("categoryImage"), createCategory);

// Get my categories (shop_owner)
router.get("/my-categories", verifyToken, authorizeRoles("shop_owner"), getMyCategories);

// Get all categories (admin)
router.get("/", verifyToken, authorizeRoles("admin"), getAllCategories);

// Update category (admin/shop_owner)
router.put("/update/:id", verifyToken, authorizeRoles("admin", "shop_owner"), upload.single("categoryImage"), updateCategory);

// Soft delete category (admin/shop_owner)
router.delete("/delete/:id", verifyToken, authorizeRoles("admin", "shop_owner"), deleteCategory);

// Public categories by shop (no auth)
router.get("/public/:shopId", getPublicCategoriesByShop);

// Public endpoint: all active categories with their active menus (paginated + search)
// e.g. GET /api/category/categories-with-menus?page=1&limit=10&search=tea
router.get("/categories-with-menus", getCategoriesWithMenus);

// Get menus for a single category (paginated + search)
// e.g. GET /api/category/category/24/menus?page=1&limit=10&search=balaji
router.get("/:id/menus", getMenusByCategory);

module.exports = router;
