// routes/shopRoutes.js

const express = require("express");
const router = express.Router();
const {
  createShop,
  updateShop,
  getShopByOwner,
  getAllShops,
  deleteShop,
  getNearbyShops,
  getShopById,
  getShopOverview
} = require("../controllers/shopController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
// ✅ Shop Owner: Create their shop (only if they don’t have one)
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("shopImage"), // 👈 handle file input named `shopImage`
  createShop
);

// ✅ Shop Owner: Get their shop
router.get(
  "/my-shop",
  verifyToken,
  authorizeRoles("shop_owner"),
  getShopByOwner
);

// ✅ Admin: Get all shops
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin"),
  getAllShops
);

// ✅ Admin + Shop Owner: Update shop
router.put(
  "/update/:id",
  verifyToken,
  authorizeRoles("admin", "shop_owner"),
  upload.single("shopImage"),
  updateShop
);

// ✅ Admin: Delete any shop
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeRoles("admin"),
  deleteShop
);
router.get("/nearby", verifyToken, getNearbyShops); // if you need auth

// ✅ user:for user get shop data using id as 
router.get('/detail/:id',getShopById)
router.get("/overview", verifyToken, authorizeRoles("shop_owner", "admin"), getShopOverview);
module.exports = router;
