// // controllers/searchController.js
// const db = require("../config/db");

// /**
//  * Unified Search API
//  * Query params:
//  *   query       - search term (required)
//  *   lat, lng    - user location for distance sorting (optional)
//  *   shopId      - filter menus by specific shop
//  *   categoryId  - filter menus by category
//  *   minPrice    - filter menus by minimum price
//  *   maxPrice    - filter menus by maximum price
//  *   pageShops, pageCategories, pageMenus - pagination per type (default 1)
//  *   limitShops, limitCategories, limitMenus - results per type (default 5/5/10)
//  */
// const unifiedSearch = async (req, res) => {
//   try {
//     const query = (req.query.query || "").trim();
//     if (!query) return res.status(400).json({ message: "Query parameter is required" });

//     // Pagination & Limits
//     const pageShops = parseInt(req.query.pageShops || "1", 10);
//     const pageCategories = parseInt(req.query.pageCategories || "1", 10);
//     const pageMenus = parseInt(req.query.pageMenus || "1", 10);

//     const limitShops = parseInt(req.query.limitShops || "5", 10);
//     const limitCategories = parseInt(req.query.limitCategories || "5", 10);
//     const limitMenus = parseInt(req.query.limitMenus || "10", 10);

//     const offsetShops = (pageShops - 1) * limitShops;
//     const offsetCategories = (pageCategories - 1) * limitCategories;
//     const offsetMenus = (pageMenus - 1) * limitMenus;

//     const lat = parseFloat(req.query.lat || 0);
//     const lng = parseFloat(req.query.lng || 0);

//     // --------------------
//     // 1️⃣ Shops Query
//     // --------------------
//     const shopDistanceCalc = lat && lng
//       ? `, (6371 * acos(
//           cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?))
//           + sin(radians(?)) * sin(radians(latitude))
//         )) AS distance`
//       : ", NULL AS distance";

//     const shopDistanceParams = lat && lng ? [lat, lng, lat] : [];

//     const [shops] = await db.query(
//       `SELECT id AS shopId, shopName, shopDescription, shopAddress, shopImage, rating, is_open
//        ${shopDistanceCalc}
//        FROM shops
//        WHERE (shopName LIKE ? OR shopDescription LIKE ?) AND is_open = 1
//        ORDER BY ${lat && lng ? "distance ASC," : ""} rating DESC
//        LIMIT ? OFFSET ?`,
//       [...shopDistanceParams, `%${query}%`, `%${query}%`, limitShops, offsetShops]
//     );

//     // --------------------
//     // 2️⃣ Categories Query
//     // --------------------
//     const [categories] = await db.query(
//       `SELECT categoryId, categoryName, categoryImage, shop_id
//        FROM categories
//        WHERE categoryName LIKE ? AND status = 'active'
//        LIMIT ? OFFSET ?`,
//       [`%${query}%`, limitCategories, offsetCategories]
//     );

//     // --------------------
//     // 3️⃣ Menu Query
//     // --------------------
//     const filters = [];
//     const menuParams = [`%${query}%`, `%${query}%`];

//     if (req.query.shopId) {
//       filters.push("m.shopId = ?");
//       menuParams.push(req.query.shopId);
//     }

//     if (req.query.categoryId) {
//       filters.push("m.categoryId = ?");
//       menuParams.push(req.query.categoryId);
//     }

//     if (req.query.minPrice) {
//       filters.push("m.price >= ?");
//       menuParams.push(req.query.minPrice);
//     }

//     if (req.query.maxPrice) {
//       filters.push("m.price <= ?");
//       menuParams.push(req.query.maxPrice);
//     }

//     const filterQuery = filters.length ? " AND " + filters.join(" AND ") : "";

//     const [menus] = await db.query(
//       `SELECT m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable, m.rating,
//               m.shopId, s.shopName, m.categoryId, c.categoryName
//        FROM menus m
//        LEFT JOIN shops s ON m.shopId = s.id
//        LEFT JOIN categories c ON m.categoryId = c.categoryId
//        WHERE (m.menuName LIKE ? OR m.ingredients LIKE ?)
//          AND m.status = 'active'
//          AND m.isAvailable = 1
//          ${filterQuery}
//        ORDER BY m.rating DESC
//        LIMIT ? OFFSET ?`,
//       [...menuParams, limitMenus, offsetMenus]
//     );

//     return res.status(200).json({
//       pagination: {
//         shops: { page: pageShops, limit: limitShops },
//         categories: { page: pageCategories, limit: limitCategories },
//         menus: { page: pageMenus, limit: limitMenus },
//       },
//       results: { shops, categories, menus },
//     });
//   } catch (err) {
//     console.error("Unified Search Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { unifiedSearch };
const db = require("../config/db");

/**
 * Unified Search API
 */
const unifiedSearch = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    if (!query) return res.status(400).json({ message: "Query parameter is required" });

    // Pagination & Limits
    const pageShops = parseInt(req.query.pageShops || "1", 10);
    const pageCategories = parseInt(req.query.pageCategories || "1", 10);
    const pageMenus = parseInt(req.query.pageMenus || "1", 10);

    const limitShops = parseInt(req.query.limitShops || "5", 10);
    const limitCategories = parseInt(req.query.limitCategories || "5", 10);
    const limitMenus = parseInt(req.query.limitMenus || "10", 10);

    const offsetShops = (pageShops - 1) * limitShops;
    const offsetCategories = (pageCategories - 1) * limitCategories;
    const offsetMenus = (pageMenus - 1) * limitMenus;

    const lat = parseFloat(req.query.lat || 0);
    const lng = parseFloat(req.query.lng || 0);

    // --------------------
    // 1️⃣ Shops Query
    // --------------------
    const shopDistanceCalc = lat && lng
      ? `, (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?))
          + sin(radians(?)) * sin(radians(latitude))
        )) AS distance`
      : ", NULL AS distance";

    const shopDistanceParams = lat && lng ? [lat, lng, lat] : [];

    const [shops] = await db.query(
      `SELECT id AS shopId, shopName, shopDescription, shopAddress, shopImage, rating, is_open
       ${shopDistanceCalc}
       FROM shops
       WHERE (shopName LIKE ? OR shopDescription LIKE ?) AND is_open = 1
       ORDER BY ${lat && lng ? "distance ASC," : ""} rating DESC
       LIMIT ? OFFSET ?`,
      [...shopDistanceParams, `%${query}%`, `%${query}%`, limitShops, offsetShops]
    );

    // --------------------
    // 2️⃣ Categories Query
    // --------------------
    const [categories] = await db.query(
      `SELECT categoryId, categoryName, categoryImage, shop_id
       FROM categories
       WHERE categoryName LIKE ? AND status = 'active'
       LIMIT ? OFFSET ?`,
      [`%${query}%`, limitCategories, offsetCategories]
    );

    // --------------------
    // 3️⃣ Menu Query
    // --------------------
    const filters = [];
    const menuParams = [`%${query}%`, `%${query}%`];

    if (req.query.shopId) {
      filters.push("m.shopId = ?");
      menuParams.push(req.query.shopId);
    }

    if (req.query.categoryId) {
      filters.push("m.categoryId = ?");
      menuParams.push(req.query.categoryId);
    }

    if (req.query.minPrice) {
      filters.push("m.price >= ?");
      menuParams.push(req.query.minPrice);
    }

    if (req.query.maxPrice) {
      filters.push("m.price <= ?");
      menuParams.push(req.query.maxPrice);
    }

    const filterQuery = filters.length ? " AND " + filters.join(" AND ") : "";

    const [menus] = await db.query(
      `SELECT m.menuId, m.menuName, m.price, m.imageUrl, m.ingredients, m.isAvailable, m.rating,
              m.shopId, s.shopName, m.categoryId, c.categoryName
       FROM menus m
       LEFT JOIN shops s ON m.shopId = s.id
       LEFT JOIN categories c ON m.categoryId = c.categoryId
       WHERE (m.menuName LIKE ? OR m.ingredients LIKE ?)
         AND m.status = 'active'
         AND m.isAvailable = 1
         ${filterQuery}
       ORDER BY m.rating DESC
       LIMIT ? OFFSET ?`,
      [...menuParams, limitMenus, offsetMenus]
    );

    return res.status(200).json({
      pagination: {
        shops: { page: pageShops, limit: limitShops },
        categories: { page: pageCategories, limit: limitCategories },
        menus: { page: pageMenus, limit: limitMenus },
      },
      results: { shops, categories, menus },
    });
  } catch (err) {
    console.error("Unified Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🔹 Search Suggestions API
 * Lightweight endpoint for instant suggestions
 */
const searchSuggestions = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Menus
    const [menus] = await db.query(
      "SELECT menuId AS id, menuName AS name FROM menus WHERE menuName LIKE ? AND status='active' LIMIT 5",
      [`%${query}%`]
    );

    // Shops
    const [shops] = await db.query(
      "SELECT id AS id, shopName AS name FROM shops WHERE shopName LIKE ? AND is_open=1 LIMIT 5",
      [`%${query}%`]
    );

    // Categories
    const [categories] = await db.query(
      "SELECT categoryId AS id, categoryName AS name FROM categories WHERE categoryName LIKE ? AND status='active' LIMIT 5",
      [`%${query}%`]
    );

    const suggestions = [
      ...menus.map((m) => ({ type: "menu", ...m })),
      ...shops.map((s) => ({ type: "shop", ...s })),
      ...categories.map((c) => ({ type: "category", ...c })),
    ];

    res.json({ suggestions });
  } catch (err) {
    console.error("Search Suggestions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { unifiedSearch, searchSuggestions };
