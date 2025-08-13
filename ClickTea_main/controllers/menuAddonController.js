const db = require("../config/db");

// ✅ 1. Create Addon (shop_owner / admin)
const createAddon = async (req, res) => {
  try {
    const { menuId, addonName, addonPrice, addonDesc } = req.body;

    // Basic validation
    if (!menuId || !addonName || !addonPrice) {
      return res.status(400).json({ message: "menuId, addonName, and addonPrice are required" });
    }

    await db.query(
      `INSERT INTO menu_addons (menuId, addonName, addonPrice, addonDesc) 
       VALUES (?, ?, ?, ?)`,
      [menuId, addonName, addonPrice, addonDesc]
    );

    res.status(201).json({ message: "Addon created successfully" });
  } catch (err) {
    console.error("Create Addon Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Get Addons for a Menu (user/shop_owner/admin)
const getAddonsByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const [addons] = await db.query(
      `SELECT * FROM menu_addons WHERE menuId = ? AND status = 'active'`,
      [menuId]
    );

    res.status(200).json(addons);
  } catch (err) {
    console.error("Fetch Addons Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Update Addon (admin / shop_owner)
const updateAddon = async (req, res) => {
  try {
    const { addonId } = req.params;
    const { addonName, addonPrice, addonDesc, status } = req.body;

    await db.query(
      `UPDATE menu_addons 
       SET addonName = ?, addonPrice = ?, addonDesc = ?, status = ? 
       WHERE addonId = ?`,
      [addonName, addonPrice, addonDesc, status, addonId]
    );

    res.status(200).json({ message: "Addon updated successfully" });
  } catch (err) {
    console.error("Update Addon Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Delete Addon (soft delete)
const deleteAddon = async (req, res) => {
  try {
    const { addonId } = req.params;

    await db.query(`UPDATE menu_addons SET status = 'inactive' WHERE addonId = ?`, [addonId]);

    res.status(200).json({ message: "Addon soft deleted" });
  } catch (err) {
    console.error("Delete Addon Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAddon,
  getAddonsByMenu,
  updateAddon,
  deleteAddon,
};
