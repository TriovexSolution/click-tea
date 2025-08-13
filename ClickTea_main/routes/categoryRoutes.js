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
} = require("../controllers/categoryController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ✅ Shop Owner / Admin: Create Category
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("categoryImage"),
  createCategory
);

// ✅ Shop Owner: Get Own Categories
router.get(
  "/my-categories",
  verifyToken,
  authorizeRoles("shop_owner"),
  getMyCategories
);

// ✅ Admin: Get All Categories
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllCategories
);

// ✅ Shop Owner / Admin: Update Category
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("categoryImage"),
  updateCategory
);

// ✅ Shop Owner / Admin: Delete Category (soft delete)
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  deleteCategory
);

// Get Public Categories by Shop (no auth)

router.get("/public/:shopId", getPublicCategoriesByShop);
// New Route: Get all active categories with their active menus (public or protected)
router.get(
  "/categories-with-menus",
  verifyToken,  // uncomment if you want auth here
  getCategoriesWithMenus
);

module.exports = router;
