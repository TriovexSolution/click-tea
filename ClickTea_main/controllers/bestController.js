const db = require("../config/db");
const asyncHandler = require("../middleware/asyncHandler");

// Add menu to best sellers
const addBestSeller = asyncHandler(async (req, res) => {
  const { menuId, displayOrder = 0 } = req.body;
  const shopId = req.user.shopId;
// console.log("ShopId from location:", shopId);

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
    `SELECT b.menuId, m.menuName, m.price, m.imageUrl, s.shopname, s.id as shopId ,b.is_bestseller
     FROM best_sellers b
     JOIN menus m ON b.menuId = m.menuId
     JOIN shops s ON b.shopId = s.id
     ORDER BY b.created_at DESC
     LIMIT 20`
  );
  res.json(rows);
});
const MAX_SELECTION = 2;

/**
 * POST /api/best-sellers/bulk
 * Body: { menuIds: [int, int] }  // empty array clears all
 * Auth: vendor (req.user.shopId required)
 */
const setBestSellersBulk = asyncHandler(async (req, res) => {
  const { menuIds = [] } = req.body;
  const shopId = req.user.shopId;
  const changedBy = req.user?.userId ?? null;

  if (!shopId) return res.status(403).json({ message: "Shop not found for this user" });

  if (!Array.isArray(menuIds)) return res.status(400).json({ message: "menuIds must be an array" });
  if (menuIds.length > MAX_SELECTION) {
    return res.status(400).json({ message: `You can select up to ${MAX_SELECTION} items` });
  }

  const conn = await db.getConnection();
  try {
    // Validate that the provided menuIds (if any) belong to this shop
    if (menuIds.length > 0) {
      const [rows] = await conn.query(
        "SELECT menuId FROM menus WHERE menuId IN (?) AND shopId = ?",
        [menuIds, shopId]
      );
      const foundIds = rows.map((r) => r.menuId);
      if (foundIds.length !== menuIds.length) {
        return res.status(400).json({ message: "One or more menuIds are invalid for this shop" });
      }
    }

    await conn.beginTransaction();

    // Step 1: clear existing flags for this shop
    await conn.query("UPDATE best_sellers SET is_bestseller = 0 WHERE shopId = ?", [shopId]);

    // Step 2: upsert the selected ones as is_bestseller = 1 (if any)
    if (menuIds.length > 0) {
      // Prepare bulk values: (shopId, menuId, is_bestseller, displayOrder)
      const values = menuIds.map((m) => [shopId, m, 1, 0]);
      await conn.query(
        "INSERT INTO best_sellers (shopId, menuId, is_bestseller, displayOrder) VALUES ? ON DUPLICATE KEY UPDATE is_bestseller = VALUES(is_bestseller), displayOrder = VALUES(displayOrder)",
        [values]
      );
    }

    // Optional: write history rows for audit (insert selected ones)
    if (true) {
      // Insert history for selected ones
      if (menuIds.length > 0) {
        const histVals = menuIds.map((m) => [shopId, m, 1, changedBy]);
        await conn.query(
          "INSERT INTO best_sellers_history (shopId, menuId, is_bestseller, changed_by) VALUES ?",
          [histVals]
        );
      }
      // You may also want to record the clearing of other items (is_bestseller=0) if needed.
    }

    await conn.commit();

    // Return canonical result: current best seller menuIds for this shop
    const [finalRows] = await conn.query("SELECT menuId FROM best_sellers WHERE shopId = ? AND is_bestseller = 1", [shopId]);
    const finalIds = finalRows.map((r) => r.menuId);

    res.json({ success: true, menuIds: finalIds });
  } catch (err) {
    await conn.rollback();
    console.error("setBestSellersBulk error:", err);
    res.status(500).json({ message: "Failed to update best sellers" });
  } finally {
    conn.release();
  }
});

module.exports = {
  addBestSeller,
  getMyBestSellers,
  deleteBestSeller,
  getBestSellersByShop,
  getAllBestSellers,
  setBestSellersBulk
};
