const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {getSinglePayLater} = require("../controllers/payLaterController")
// GET /orders/my-pay-later/:payLaterId/shop/:shopId
router.get(
    "/my-pay-later/:payLaterId/shop/:shopId",
    verifyToken,
    authorizeRoles("user"),
    getSinglePayLater
  );
  