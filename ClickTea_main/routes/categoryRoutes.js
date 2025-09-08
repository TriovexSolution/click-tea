// // routes/categoryRoutes.js
// const express = require("express");
// const router = express.Router();
// const {
//   createCategory,
//   getAllCategories,
//   getMyCategories,
//   updateCategory,
//   deleteCategory,
//   getPublicCategoriesByShop,
//   getCategoriesWithMenus,
//   getMenusByCategory,
// } = require("../controllers/categoryController");

// const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// // Create - admin/shop_owner
// router.post("/create", verifyToken, authorizeRoles("admin", "shop_owner"), upload.single("categoryImage"), createCategory);

// // Get my categories (shop_owner)
// router.get("/my-categories", verifyToken, authorizeRoles("shop_owner"), getMyCategories);

// // Get all categories (admin)
// router.get("/", verifyToken, authorizeRoles("admin"), getAllCategories);

// // Update category (admin/shop_owner)
// router.put("/update/:id", verifyToken, authorizeRoles("admin", "shop_owner"), upload.single("categoryImage"), updateCategory);

// // Soft delete category (admin/shop_owner)
// router.delete("/delete/:id", verifyToken, authorizeRoles("admin", "shop_owner"), deleteCategory);

// // Public categories by shop (no auth)
// router.get("/public/:shopId", getPublicCategoriesByShop);

// // Public endpoint: all active categories with their active menus (paginated + search)
// // e.g. GET /api/category/categories-with-menus?page=1&limit=10&search=tea
// router.get("/categories-with-menus", getCategoriesWithMenus);

// // Get menus for a single category (paginated + search)
// // e.g. GET /api/category/category/24/menus?page=1&limit=10&search=balaji
// router.get("/:id/menus", getMenusByCategory);

// module.exports = router;
const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getMyCategories,
  updateCategory,
  deleteCategory,
  getPublicCategoriesByShop,
  getCategoriesWithMenus,
  getMenusByCategory
} = require("../controllers/categoryController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate");

// Create category
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("categoryImage"),
  [body("categoryName").notEmpty().withMessage("categoryName is required")],
  validate,
  createCategory
);

// My categories
router.get("/me", verifyToken, authorizeRoles("shop_owner"), getMyCategories);

// All categories (admin)
router.get("/", verifyToken, authorizeRoles("admin"), getAllCategories);

// Update
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("categoryImage"),
  [param("id").isInt().withMessage("Invalid category id")],
  validate,
  updateCategory
);

// Soft delete
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  [param("id").isInt().withMessage("Invalid category id")],
  validate,
  deleteCategory
);

// Public routes
router.get("/public/:shopId", [param("shopId").isInt()], validate, getPublicCategoriesByShop);
router.get("/categories-with-menus", getCategoriesWithMenus);
// GET /api/category/:id/menus?page=1&limit=10&search=tea
router.get(
  "/:id/menus",
  // [
  //   param("id").isInt(),
  //   query("page").optional().isInt({ min: 1 }).toInt(),
  //   query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  //   query("search").optional().isString().trim(),
  // ],
  validate,
  getMenusByCategory
);
module.exports = router;
