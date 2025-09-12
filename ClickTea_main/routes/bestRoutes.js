const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();

const {
  addBestSeller,
  getMyBestSellers,
  deleteBestSeller,
  getBestSellersByShop,
  getAllBestSellers,
  setBestSellersBulk
} = require("../controllers/bestController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// ✅ Vendor adds best seller
router.post(
  "/",
  verifyToken,
  authorizeRoles("shop_owner"),
  [body("menuId").isInt().withMessage("menuId required")],
  validate,
  addBestSeller
);

// ✅ Vendor gets their best sellers
router.get(
  "/me",
  verifyToken,
  authorizeRoles("shop_owner"),
  getMyBestSellers
);

// ✅ Vendor removes a best seller (by menuId)
router.delete(
  "/:menuId",
  verifyToken,
  authorizeRoles("shop_owner"),
  [param("menuId").isInt().withMessage("Invalid menuId")],
  validate,
  deleteBestSeller
);

// ✅ Public: get best sellers of a shop
router.get(
  "/shop/:shopId",
  [param("shopId").isInt().withMessage("Invalid shopId")],
  validate,
  getBestSellersByShop
);
router.get("/all", getAllBestSellers);
router.post(
  "/bulk",
  verifyToken,
  authorizeRoles("shop_owner"),
  [body("menuIds").isArray({ min: 1 }).withMessage("menuIds must be an array")],
  validate,
  setBestSellersBulk
);

module.exports = router;
