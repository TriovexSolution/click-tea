// // controllers/shopController.js

// const db = require("../config/db");
// const jwt = require("jsonwebtoken");
// // // ✅ 1. Create Shop
// // const createShop = async (req, res) => {
// //   try {
// //     const {
// //       shopname,
// //       shopDescription,
// //       shopAddress,
// //       building_name,
// //       latitude,
// //       longitude,
// //       phone,
// //       email,
// //       country_code,
// //       is_open,
// //     } = req.body;

// //     const shopImage = req.file ? req.file.filename : null;

// //     let owner_id;

// //     // If admin, use provided owner_id
// //     if (req.user.role === "admin") {
// //       owner_id = req.body.owner_id;
// //       if (!owner_id) {
// //         return res.status(400).json({ message: "owner_id is required" });
// //       }
// //     } else {
// //       // If shop_owner, use their own user id
// //       owner_id = req.user.userId;

// //       // Check if shop already exists
// //       const [existing] = await db.query("SELECT * FROM shops WHERE owner_id = ?", [owner_id]);
// //       if (existing.length > 0) {
// //         return res.status(409).json({ message: "You already have a shop" });
// //       }
// //     }

// //     // Insert shop into DB
// //     await db.query(
// //       `INSERT INTO shops 
// //       (shopname, shopDescription, shopAddress, building_name, latitude, longitude, 
// //       shopImage, phone, email, country_code, is_open, owner_id) 
// //       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
// //       [
// //         shopname,
// //         shopDescription,
// //         shopAddress,
// //         building_name,
// //         latitude,
// //         longitude,
// //         shopImage,
// //         phone,
// //         email,
// //         country_code,
// //         is_open,
// //         owner_id,
// //       ]
// //     );

// //     // res.status(201).json({ message: "Shop created successfully",
// //     //    owner_id: owner_id, // change on 10825 date 
// //     //  });
// //     const [result] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [owner_id]);
// // const shop_id = result[0]?.id;
// // console.log("Manual test result:", result);
// // res.status(201).json({
// //   message: "Shop created successfully",
// //   owner_id,
// //   shop_id,
// // });

// //   } catch (err) {
// //     console.error("Create shop error:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
// const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";

// const createShop = async (req, res) => {
//   const conn = await db.getConnection();
//   try {
//     const {
//       shopname,
//       shopDescription,
//       shopAddress,
//       building_name,
//       latitude,
//       longitude,
//       phone,
//       email,
//       country_code,
//       is_open,
//       owner_id: ownerIdFromBody,
//     } = req.body;

//     const shopImage = req.file ? req.file.filename : null;
//     // canonical user id from middleware (normalize middleware to set userId)
//     const callerUserId = req.user?.userId ?? req.user?.id ?? null;

//     let owner_id;

//     // If admin, use provided owner_id
//     if (req.user?.role === "admin") {
//       owner_id = ownerIdFromBody;
//       if (!owner_id) {
//         await conn.release();
//         return res.status(400).json({ message: "owner_id is required for admin" });
//       }
//     } else {
//       // If shop_owner, use their own user id
//       owner_id = callerUserId;
//       if (!owner_id) {
//         await conn.release();
//         return res.status(401).json({ message: "Unauthorized: no user id" });
//       }
//     }

//     // Use transaction to ensure consistency between shops and users table
//     await conn.beginTransaction();

//     // Prevent race: check existing shop for this owner
//     const [existing] = await conn.query("SELECT id FROM shops WHERE owner_id = ? LIMIT 1", [owner_id]);
//     if (existing && existing.length > 0) {
//       await conn.rollback();
//       await conn.release();
//       return res.status(409).json({ message: "You already have a shop" });
//     }

//     // Insert shop
//     const insertSql = `INSERT INTO shops 
//       (shopname, shopDescription, shopAddress, building_name, latitude, longitude, 
//        shopImage, phone, email, country_code, is_open, owner_id, created_at)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

//     const [insertRes] = await conn.query(insertSql, [
//       shopname,
//       shopDescription,
//       shopAddress,
//       building_name,
//       latitude,
//       longitude,
//       shopImage,
//       phone,
//       email,
//       country_code,
//       is_open,
//       owner_id,
//     ]);

//     // insertRes.insertId is canonical created id
//     const shop_id = insertRes.insertId;

//     // Try to update users table with shop id; try both naming conventions
//     let updated = false;
//     try {
//       await conn.query("UPDATE users SET shopId = ? WHERE id = ?", [shop_id, owner_id]);
//       updated = true;
//     } catch (e1) {
//       // fallback column name snake_case
//       try {
//         await conn.query("UPDATE users SET shop_id = ? WHERE id = ?", [shop_id, owner_id]);
//         updated = true;
//       } catch (e2) {
//         // non-fatal: log and continue (we still commit shop insert)
//         console.warn("createShop: could not update users table with shop id (tried shopId & shop_id)", e2);
//       }
//     }

//     // Commit transaction
//     await conn.commit();
//     await conn.release();

//     // Re-issue short-lived access token containing shopId so client can immediately use protected endpoints
//     const payload = { userId: owner_id, role: req.user?.role || "shop_owner", shopId: shop_id };
//     const newAccessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

//     // Respond with created shop id and new token (client should replace stored token)
//     return res.status(201).json({
//       message: "Shop created successfully",
//       owner_id,
//       shop_id,
//       token: newAccessToken,
//       shopUpdatedInUserTable: updated,
//     });
//   } catch (err) {
//     try {
//       await conn.rollback();
//     } catch (e) {
//       console.warn("createShop rollback failed:", e);
//     }
//     await conn.release();
//     console.error("Create shop error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ 2. Update Shop (admin or shop_owner)
// const updateShop = async (req, res) => {
//   try {
//     const shopId = req.params.id;

//     // Check if shop_owner is editing their own shop
//     if (req.user.role === "shop_owner") {
//       const [shop] = await db.query("SELECT * FROM shops WHERE id = ? AND owner_id = ?", [
//         shopId,
//         req.user.id,
//       ]);
//       if (shop.length === 0) {
//         return res.status(403).json({ message: "You don't have permission to update this shop" });
//       }
//     }

//     const {
//       shopname,
//       shopDescription,
//       shopAddress,
//       building_name,
//       latitude,
//       longitude,
//       phone,
//       email,
//       country_code,
//       is_open,
//     } = req.body;

//     const shopImage = req.file ? req.file.filename : req.body.shopImage;

//     await db.query(
//       `UPDATE shops SET 
//       shopname = ?, shopDescription = ?, shopAddress = ?, building_name = ?, 
//       latitude = ?, longitude = ?, shopImage = ?, phone = ?, email = ?, 
//       country_code = ?, is_open = ? 
//       WHERE id = ?`,
//       [
//         shopname,
//         shopDescription,
//         shopAddress,
//         building_name,
//         latitude,
//         longitude,
//         shopImage,
//         phone,
//         email,
//         country_code,
//         is_open,
//         shopId,
//       ]
//     );

//     res.status(200).json({ message: "Shop updated successfully" });
//   } catch (err) {
//     console.error("Update shop error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ 3. Get Shop by Owner (shop_owner only)
// const getShopByOwner = async (req, res) => {
//   try {
//     const [shop] = await db.query("SELECT * FROM shops WHERE owner_id = ?", [req.user.id]);

//     if (shop.length === 0) {
//       return res.status(404).json({ message: "No shop found" });
//     }

//     res.status(200).json(shop[0]);
//   } catch (err) {
//     console.error("Get shop by owner error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ 4. Get All Shops (admin only)
// const getAllShops = async (req, res) => {
//   try {
//     const [shops] = await db.query("SELECT * FROM shops");
//     res.status(200).json(shops);
//   } catch (err) {
//     console.error("Get all shops error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // ✅ 6. Get Single Shop by ID (for users)
// const getShopById = async (req, res) => {
//   try {
//     const shopId = req.params.id;

//     if (!shopId) {
//       return res.status(400).json({ message: "Shop ID is required" });
//     }

//     const [shop] = await db.query("SELECT * FROM shops WHERE id = ?", [shopId]);

//     if (shop.length === 0) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     res.status(200).json(shop[0]);
//   } catch (err) {
//     console.error("Get shop by ID error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ✅ 5. Delete Shop (admin only)
// const deleteShop = async (req, res) => {
//   try {
//     const shopId = req.params.id;

//     await db.query("DELETE FROM shops WHERE id = ?", [shopId]);

//     res.status(200).json({ message: "Shop deleted successfully" });
//   } catch (err) {
//     console.error("Delete shop error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getNearbyShops = async (req, res) => {
//   const {
//     lat,
//     lng,
//     search = "",
//     onlyOpen = false,
//     limit = 10,
//     offset = 0,
//   } = req.query;

//   if (!lat || !lng) {
//     return res.status(400).json({ message: "Latitude and longitude required" });
//   }

//   const radiusInKm = 3;

//   const query = `
//     SELECT id, shopname, shopImage, building_name, latitude, longitude, is_open, distance,
//       CASE 
//         WHEN distance <= 0.3 THEN 1
//         WHEN distance <= 3 THEN 2
//         ELSE 3
//       END AS priority
//     FROM (
//       SELECT *,
//         (6371 * acos(
//           cos(radians(?)) * cos(radians(latitude)) *
//           cos(radians(longitude) - radians(?)) +
//           sin(radians(?)) * sin(radians(latitude))
//         )) AS distance
//       FROM shops
//     ) AS calculated
//     WHERE distance <= ?
//     ${onlyOpen === "true" ? "AND is_open = 1" : ""}
//     ${search ? "AND shopname LIKE ?" : ""}
//     ORDER BY priority ASC, distance ASC
//     LIMIT ? OFFSET ?;
//   `;

//   const params = [lat, lng, lat, radiusInKm];
//   if (search) params.push(`%${search}%`);
//   params.push(Number(limit), Number(offset));

//   try {
//     const [results] = await db.query(query, params);
//     // console.log("Nearby shops query results:", results);

//     res.status(200).json(results);
//   } catch (err) {
//     console.error("Error fetching nearby shops:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   createShop,
//   updateShop,
//   getShopByOwner,
//   getAllShops,
//   deleteShop,
//   getNearbyShops,
//   getShopById
// };

// controllers/shopController.js

const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Access token config
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";

// ✅ 1. Create Shop
const createShop = async (req, res) => {
  let conn;
  try {
    conn = await db.getConnection();

    const {
      shopname,
      shopDescription,
      shopAddress,
      building_name,
      latitude,
      longitude,
      phone,
      email,
      country_code,
      is_open,
      owner_id: ownerIdFromBody,
    } = req.body;

    const shopImage = req.file ? req.file.filename : null;
    const callerUserId = req.user?.userId ?? req.user?.id ?? null;

    let owner_id;

    if (req.user?.role === "admin") {
      // Admin must provide owner_id
      if (!ownerIdFromBody) {
        return res.status(400).json({ message: "owner_id is required for admin" });
      }
      owner_id = ownerIdFromBody;
    } else {
      // Shop owner uses their own ID
      owner_id = callerUserId;
      if (!owner_id) {
        return res.status(401).json({ message: "Unauthorized: no user id" });
      }
    }

    await conn.beginTransaction();

    // Ensure one shop per owner
    const [existing] = await conn.query("SELECT id FROM shops WHERE owner_id = ? LIMIT 1", [owner_id]);
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: "You already have a shop" });
    }

    // Insert new shop
    const insertSql = `
      INSERT INTO shops 
      (shopname, shopDescription, shopAddress, building_name, latitude, longitude, 
       shopImage, phone, email, country_code, is_open, owner_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [insertRes] = await conn.query(insertSql, [
      shopname,
      shopDescription,
      shopAddress,
      building_name,
      latitude,
      longitude,
      shopImage,
      phone,
      email,
      country_code,
      is_open,
      owner_id,
    ]);

    const shop_id = insertRes.insertId;

    // Try updating users table with new shop_id
    let updated = false;
    try {
      await conn.query("UPDATE users SET shopId = ? WHERE id = ?", [shop_id, owner_id]);
      updated = true;
    } catch {
      try {
        await conn.query("UPDATE users SET shop_id = ? WHERE id = ?", [shop_id, owner_id]);
        updated = true;
      } catch (e2) {
        console.warn("createShop: could not update users table with shop id", e2);
      }
    }

    await conn.commit();

    // Issue new access token including shopId
    const payload = { userId: owner_id, role: req.user?.role || "shop_owner", shopId: shop_id };
    const newAccessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });

    return res.status(201).json({
      message: "Shop created successfully",
      owner_id,
      shop_id,
      token: newAccessToken,
      shopUpdatedInUserTable: updated,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Create shop error:", err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    if (conn) conn.release();
  }
};

// ✅ 2. Update Shop
const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;

    if (req.user.role === "shop_owner") {
      const [shop] = await db.query("SELECT * FROM shops WHERE id = ? AND owner_id = ?", [
        shopId,
        req.user.id,
      ]);
      if (shop.length === 0) {
        return res.status(403).json({ message: "You don't have permission to update this shop" });
      }
    }

    const {
      shopname,
      shopDescription,
      shopAddress,
      building_name,
      latitude,
      longitude,
      phone,
      email,
      country_code,
      is_open,
    } = req.body;

    const shopImage = req.file ? req.file.filename : req.body.shopImage;

    await db.query(
      `UPDATE shops SET 
        shopname = ?, shopDescription = ?, shopAddress = ?, building_name = ?, 
        latitude = ?, longitude = ?, shopImage = ?, phone = ?, email = ?, 
        country_code = ?, is_open = ? 
      WHERE id = ?`,
      [
        shopname,
        shopDescription,
        shopAddress,
        building_name,
        latitude,
        longitude,
        shopImage,
        phone,
        email,
        country_code,
        is_open,
        shopId,
      ]
    );

    res.status(200).json({ message: "Shop updated successfully" });
  } catch (err) {
    console.error("Update shop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Get Shop by Owner
const getShopByOwner = async (req, res) => {
  try {
    const [shop] = await db.query("SELECT * FROM shops WHERE owner_id = ?", [req.user.id]);

    if (shop.length === 0) {
      return res.status(404).json({ message: "No shop found" });
    }

    res.status(200).json(shop[0]);
  } catch (err) {
    console.error("Get shop by owner error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 4. Get All Shops (admin only)
const getAllShops = async (req, res) => {
  try {
    const [shops] = await db.query("SELECT * FROM shops");
    res.status(200).json(shops);
  } catch (err) {
    console.error("Get all shops error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 5. Get Shop by ID
const getShopById = async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) return res.status(400).json({ message: "Shop ID is required" });

    const [shop] = await db.query("SELECT * FROM shops WHERE id = ?", [shopId]);
    if (shop.length === 0) return res.status(404).json({ message: "Shop not found" });

    res.status(200).json(shop[0]);
  } catch (err) {
    console.error("Get shop by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 6. Delete Shop
const deleteShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    await db.query("DELETE FROM shops WHERE id = ?", [shopId]);
    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (err) {
    console.error("Delete shop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 7. Get Nearby Shops
const getNearbyShops = async (req, res) => {
  const { lat, lng, search = "", onlyOpen = false, limit = 10, offset = 0 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude required" });
  }

  const radiusInKm = 3;

  const query = `
    SELECT id, shopname, shopImage, building_name, latitude, longitude, is_open, distance,
      CASE 
        WHEN distance <= 0.3 THEN 1
        WHEN distance <= 3 THEN 2
        ELSE 3
      END AS priority
    FROM (
      SELECT *,
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM shops
    ) AS calculated
    WHERE distance <= ?
    ${onlyOpen === "true" ? "AND is_open = 1" : ""}
    ${search ? "AND shopname LIKE ?" : ""}
    ORDER BY priority ASC, distance ASC
    LIMIT ? OFFSET ?;
  `;

  const params = [lat, lng, lat, radiusInKm];
  if (search) params.push(`%${search}%`);
  params.push(Number(limit), Number(offset));

  try {
    const [results] = await db.query(query, params);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching nearby shops:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const getShopOverview = async (req, res) => {
  try {
    // prefer shopId from token; fallback: look up shop by owner id
    let shopId = req.user?.shopId ?? null;

    if (!shopId) {
      // try find by owner id (shop_owner)
      const ownerId = req.user?.userId ?? req.user?.id;
      if (!ownerId) return res.status(400).json({ message: "No shop associated with user" });
      const [shopRows] = await db.query("SELECT id FROM shops WHERE owner_id = ? LIMIT 1", [ownerId]);
      if (!shopRows || shopRows.length === 0) return res.status(404).json({ message: "Shop not found" });
      shopId = shopRows[0].id;
    }

    // Query for today's counts and revenue (server timezone: uses DATE(created_at))
    const [ordersTodayRows] = await db.query(
      `SELECT COUNT(*) AS ordersToday, COALESCE(SUM(totalAmount), 0) AS revenueToday
       FROM orders
       WHERE shopId = ? AND DATE(created_at) = CURDATE()`,
      [shopId]
    );

    const overview = {
      shopId,
      ordersToday: ordersTodayRows[0]?.ordersToday ?? 0,
      revenueToday: Number(ordersTodayRows[0]?.revenueToday ?? 0),
    };

    return res.status(200).json(overview);
  } catch (err) {
    console.error("getShopOverview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createShop,
  updateShop,
  getShopByOwner,
  getAllShops,
  getShopById,
  deleteShop,
  getNearbyShops,
  getShopOverview 
};
