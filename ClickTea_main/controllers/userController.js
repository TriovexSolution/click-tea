const { log } = require("console");
const db = require("../config/db");
const path = require("path");
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const [rows] = await db.query(
      `SELECT u.id AS user_id, u.username, u.email AS user_email, u.phone AS user_phone,
              u.country_code AS user_country_code, u.status, u.last_login,
              u.created_at AS user_created_at, u.coin, u.is_subscription, u.role,
              u.userImage, s.id AS shop_id, s.shopname, s.shopDescription, s.shopAddress,
              s.building_name, s.shopImage, s.is_open, s.email AS shop_email, s.phone AS shop_phone,
              s.country_code AS shop_country_code, s.created_at AS shop_created_at
       FROM users u LEFT JOIN shops s ON u.id = s.owner_id WHERE u.id = ?`,
      [userId]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: "User not found" });

    const profile = rows[0];

    // Normalize slashes and build public URL
    const rawImage = profile.userImage ? String(profile.userImage) : null;
    const normalized = rawImage ? rawImage.replace(/\\/g, "/") : null;
    const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
    const publicUserImage = normalized
      ? (normalized.startsWith("http://") || normalized.startsWith("https://")
         ? normalized
         : `${baseUrl}/${normalized.replace(/^\/+/, "")}`)
      : null;

    return res.status(200).json({
      userId: profile.user_id,
      username: profile.username,
      userEmail: profile.user_email,
      userPhone: profile.user_phone,
      userCountryCode: profile.user_country_code,
      coin: profile.coin,
      is_subscription: profile.is_subscription,
      role: profile.role,
      userImage: publicUserImage,      // <- full URL or null
      status: profile.status,
      lastLogin: profile.last_login,
      userCreatedAt: profile.user_created_at,

      shopId: profile.shop_id,
      shopName: profile.shopname,
      shopDescription: profile.shopDescription,
      shopAddress: profile.shopAddress,
      buildingName: profile.building_name,
      shopImage: profile.shopImage ? String(profile.shopImage).replace(/\\/g, "/") : null,
      isOpen: profile.is_open,
      shopEmail: profile.shop_email,
      shopPhone: profile.shop_phone,
      shopCountryCode: profile.shop_country_code,
      shopCreatedAt: profile.shop_created_at
    });
  } catch (err) {
    console.error("User profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, phone, country_code } = req.body;

    // ✅ build update object dynamically
    let updateFields = [];
    let values = [];

    if (username) {
      updateFields.push("username = ?");
      values.push(username);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (phone) {
      updateFields.push("phone = ?");
      values.push(phone);
    }
    if (country_code) {
      updateFields.push("country_code = ?");
      values.push(country_code);
    }

    // ✅ handle profile image upload
    if (req.file) {
      const imagePath = path.join("uploads/users", req.file.filename);
      updateFields.push("userImage = ?");
      values.push(imagePath);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      values
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getUserProfile,
  updateUserProfile
};
