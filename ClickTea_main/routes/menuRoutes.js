const express = require("express");
const router = express.Router();

const {
  createMenu,
  getMyMenus,
  getAllMenus,
  updateMenu,
  deleteMenu,
  getMenusByShopId,
  getMenusByCategory
} = require("../controllers/menuController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ✅ Create menu (Admin or Shop Owner)
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("imageUrl"),
  createMenu
);

// ✅ Get menus by logged-in shop_owner
router.get(
  "/my-menus",
  verifyToken,
  authorizeRoles("shop_owner"),
  getMyMenus
);

// ✅ Get all menus (Admin only)
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllMenus
);

// ✅ Update a menu
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("imageUrl"),
  updateMenu
);

// ✅ Soft delete a menu
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  deleteMenu
);
router.get("/public/:shopId", getMenusByShopId);
// ✅ Add this route in your routes/menu.js or wherever you define routes
router.get("/public/:shopId/category/:categoryId", getMenusByCategory);

module.exports = router;
