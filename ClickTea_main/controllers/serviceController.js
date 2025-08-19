const db = require("../config/db");

/**
 * Check if any shop exists within a given radius (default 3 km)
 * GET /api/service/availability?lat=..&lng=..
 */
const checkServiceAvailability = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 3 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ available: false, message: "Latitude and longitude required" });
    }

    // Haversine formula in SQL to calculate distance between user and shops
    const query = `
      SELECT id, shopname,
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(latitude))
        )) AS distance
      FROM shops
      HAVING distance <= ?
      ORDER BY distance ASC
      LIMIT 1;
    `;

    const [rows] = await db.query(query, [lat, lng, lat, radiusKm]);

    if (rows.length > 0) {
      return res.json({
        available: true,
        nearestShop: rows[0],
        message: `Service available! Nearest shop: ${rows[0].shopname}, ${rows[0].distance.toFixed(2)} km away`
      });
    }

    return res.json({
      available: false,
      message: "Sorry, service not available in your area"
    });

  } catch (err) {
    console.error("Service availability error:", err);
    return res.status(500).json({ available: false, message: "Server error" });
  }
};

module.exports = { checkServiceAvailability };
