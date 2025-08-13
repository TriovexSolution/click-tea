const express = require("express");
const router = express.Router();
const { addNewAddress ,getAddressList } = require("../controllers/addressController");
const { verifyToken } = require("../middleware/authMiddleware");

// Add new address for logged-in user
router.post("/add", verifyToken, addNewAddress);

// Get saved addresses list
router.get("/list", verifyToken, getAddressList);
module.exports = router;
