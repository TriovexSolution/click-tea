const express = require("express");
const router = express.Router();

const {
  createAddon,
  getAddonsByMenu,
  updateAddon,
  deleteAddon,
} = require("../controllers/menuAddonController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Create Addon (admin / shop_owner)
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  createAddon
);

// ✅ Get Addons by Menu ID (public)
router.get(
  "/menu/:menuId",
  getAddonsByMenu
);

// ✅ Update Addon (admin / shop_owner)
router.put(
  "/update/:addonId",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  updateAddon
);

// ✅ Soft Delete Addon (admin / shop_owner)
router.delete(
  "/delete/:addonId",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  deleteAddon
);

module.exports = router;
