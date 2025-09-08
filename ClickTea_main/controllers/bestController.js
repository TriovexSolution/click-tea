const db = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

// Add menu to best sellers
const addBestSeller = asyncHandler(async (req, res) => {
  const { menuId, displayOrder = 0 } = req.body;
  const shopId = req.user.shopId;
console.log("ShopId from location:", shopId);

  if (!shopId) return res.status(403).json({ message: "Shop not found for this user" });

  await db.query(
    `INSERT INTO best_sellers (shopId, menuId, displayOrder) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE displayOrder = ?`,
    [shopId, menuId, displayOrder, displayOrder]
  );

  res.status(201).json({ message: "Added to best sellers" });
});

// Get best sellers for current shop (vendor)
const getMyBestSellers = asyncHandler(async (req, res) => {
  const shopId = req.user.shopId;
  const [rows] = await db.query(
    `SELECT b.menuId, b.displayOrder, m.menuName, m.price, m.imageUrl
     FROM best_sellers b
     JOIN menus m ON b.menuId = m.menuId
     WHERE b.shopId = ?
     ORDER BY b.displayOrder ASC, b.created_at DESC`,
    [shopId]
  );
  res.json(rows);
});

// Delete best seller by menuId
const deleteBestSeller = asyncHandler(async (req, res) => {
  const { menuId } = req.params;
  const shopId = req.user.shopId;

  const [result] = await db.query(
    "DELETE FROM best_sellers WHERE menuId = ? AND shopId = ?",
    [menuId, shopId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Best seller not found" });
  }

  res.json({ message: "Removed from best sellers" });
});

// Public: get best sellers for a shop
const getBestSellersByShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const [rows] = await db.query(
    `SELECT b.menuId, m.menuName, m.price, m.imageUrl
     FROM best_sellers b
     JOIN menus m ON b.menuId = m.menuId
     WHERE b.shopId = ?
     ORDER BY b.displayOrder ASC, b.created_at DESC`,
    [shopId]
  );
  res.json(rows);
});
// Public: get all best sellers across shops
const getAllBestSellers = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT b.menuId, m.menuName, m.price, m.imageUrl, s.shopname, s.id as shopId
     FROM best_sellers b
     JOIN menus m ON b.menuId = m.menuId
     JOIN shops s ON b.shopId = s.id
     ORDER BY b.created_at DESC
     LIMIT 20`
  );
  res.json(rows);
});

module.exports = {
  addBestSeller,
  getMyBestSellers,
  deleteBestSeller,
  getBestSellersByShop,
  getAllBestSellers
};
