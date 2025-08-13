const express = require("express");
const router = express.Router();

const {
  addFavourite,
  removeFavourite,
  getUserFavourites,
  getAllFavourites,
} = require("../controllers/favourtitesController");

const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Add to favourites
router.post("/add", verifyToken, authorizeRoles("user"), addFavourite);

// ✅ Remove from favourites
router.put("/remove", verifyToken, authorizeRoles("user"), removeFavourite);

// ✅ Get logged-in user's favourites
router.get("/my", verifyToken, authorizeRoles("user"), getUserFavourites);

// ✅ Admin: View all
router.get("/all", verifyToken, authorizeRoles("admin"), getAllFavourites);

module.exports = router;
