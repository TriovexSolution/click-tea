const db = require("../config/db");

// ✅ Add to favourites
const addFavourite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    if (!itemId || !itemType) {
      return res.status(400).json({ message: "itemId and itemType are required" });
    }

    // Check if already exists
    const [existing] = await db.query(
      "SELECT * FROM favourites WHERE userId = ? AND itemId = ? AND itemType = ?",
      [userId, itemId, itemType]
    );

    if (existing.length > 0) {
      if (existing[0].isActive === 1) {
        return res.status(409).json({ message: "Already in favourites" });
      } else {
        // If inactive, reactivate it
        await db.query(
          "UPDATE favourites SET isActive = 1, created_at = NOW() WHERE favouriteId = ?",
          [existing[0].favouriteId]
        );
        return res.status(200).json({ message: "Favourite reactivated" });
      }
    }

    // Insert new favourite
    await db.query(
      "INSERT INTO favourites (userId, itemId, itemType) VALUES (?, ?, ?)",
      [userId, itemId, itemType]
    );

    res.status(201).json({ message: "Favourite added" });
  } catch (err) {
    console.error("Add Favourite Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Remove from favourites (soft delete)
const removeFavourite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const userId = req.user.id;

    await db.query(
      "UPDATE favourites SET isActive = 0 WHERE userId = ? AND itemId = ? AND itemType = ?",
      [userId, itemId, itemType]
    );

    res.status(200).json({ message: "Removed from favourites" });
  } catch (err) {
    console.error("Remove Favourite Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all favourites of a user (active only)
const getUserFavourites = async (req, res) => {
  try {
    const userId = req.user.id;

    const [favs] = await db.query(
      "SELECT * FROM favourites WHERE userId = ? AND isActive = 1",
      [userId]
    );

    res.status(200).json(favs);
  } catch (err) {
    console.error("Get Favourites Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin: Get all favourites (for analysis)
const getAllFavourites = async (req, res) => {
  try {
    const [favs] = await db.query("SELECT * FROM favourites");
    res.status(200).json(favs);
  } catch (err) {
    console.error("Admin Get All Favs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFavourite,
  removeFavourite,
  getUserFavourites,
  getAllFavourites,
};
