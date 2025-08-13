const express = require("express");
const router = express.Router();

const {
  addFeedback,
  editFeedback,
  getFeedbacksByMenu,
} = require("../controllers/menuFeedBackController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ User adds feedback to a menu
router.post(
  "/add",
  verifyToken,
  authorizeRoles("user"),
  addFeedback
);

// ✅ User edits their own feedback (only once)
router.put(
  "/edit/:feedbackId",
  verifyToken,
  authorizeRoles("user"),
  editFeedback
);

// ✅ Public or Admin/Shop Owner views feedback of a menu
router.get(
  "/menu/:menuId",
  verifyToken,
  authorizeRoles("admin", "shop_owner", "user"),
  getFeedbacksByMenu
);

module.exports = router;
