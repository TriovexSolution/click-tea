// const express = require("express");
// const router = express.Router();

// const {
//   createMenu,
//   getMyMenus,
//   getAllMenus,
//   updateMenu,
//   deleteMenu,
//   getMenusByShopId,
//   getMenusByCategory,
//   getMenuById
// } = require("../controllers/menuController");

// const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// // ✅ Create menu (Admin or Shop Owner)
// router.post(
//   "/create",
//   verifyToken,
//   authorizeRoles("admin", "shop_owner"),
//   upload.single("imageUrl"),
//   createMenu
// );

// // ✅ Get menus by logged-in shop_owner
// router.get(
//   "/my-menus",
//   verifyToken,
//   authorizeRoles("shop_owner"),
//   getMyMenus
// );

// // ✅ Get all menus (Admin only)
// router.get(
//   "/",
//   verifyToken,
//   authorizeRoles("admin"),
//   getAllMenus
// );

// // ✅ Update a menu
// router.put(
//   "/update/:id",
//   verifyToken,
//   authorizeRoles("admin", "shop_owner"),
//   upload.single("imageUrl"),
//   updateMenu
// );

// // ✅ Soft delete a menu
// router.delete(
//   "/delete/:id",
//   verifyToken,
//   authorizeRoles("admin", "shop_owner"),
//   deleteMenu
// );
// router.get("/public/:shopId", getMenusByShopId);
// // ✅ Add this route in your routes/menu.js or wherever you define routes
// router.get("/public/:shopId/category/:categoryId", getMenusByCategory);

// // Public single menu endpoint
// // GET /api/menu/:id
// router.get("/:id",verifyToken, getMenuById);
// module.exports = router;
const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

const {
  createMenu,
  getMyMenus,
  getAllMenus,
  updateMenu,
  deleteMenu,
  getMenusByShopId,
  getMenusByCategory,
  getMenuById,
} = require("../controllers/menuController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validate"); // custom validator wrapper

// ✅ Create menu (Admin or Shop Owner)
router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("imageUrl"),
  [
    body("menuName").notEmpty().withMessage("menuName is required"),
    body("price").isFloat({ min: 0 }).withMessage("price must be a positive number"),
    body("categoryId").isInt().withMessage("categoryId must be an integer"),
  ],
  validate,
  createMenu
);

// ✅ Get menus by logged-in shop_owner
router.get(
  "/me",
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
  "/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("imageUrl"),
  [
    param("id").isInt().withMessage("Invalid menu id"),
    body("price").optional().isFloat({ min: 0 }),
  ],
  validate,
  updateMenu
);

// ✅ Soft delete a menu
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  [param("id").isInt().withMessage("Invalid menu id")],
  validate,
  deleteMenu
);

// ✅ Public routes
router.get("/shop/:shopId", [param("shopId").isInt()], validate, getMenusByShopId);
router.get("/category/:categoryId", [param("categoryId").isInt()], validate, getMenusByCategory);
router.get("/:id", [param("id").isInt()], validate, getMenuById);

module.exports = router;
