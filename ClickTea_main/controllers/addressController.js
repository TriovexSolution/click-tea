const db = require("../config/db");

// Add new address for logged-in user
const addNewAddress = async (req, res) => {
  try {
    const userId = req.user.id; // assuming req.user has user info from auth middleware
    const {
      fullName,
      phoneNumber,
      pincode,
      state,
      city,
      houseNumber,
      roadArea,
      landmark,
      addressType, // Home, Work, Other
    } = req.body;

    if (!fullName || !phoneNumber || !pincode || !state || !city) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Insert address into DB (assuming you have a table user_addresses)
    await db.query(
      `INSERT INTO user_addresses 
      (user_id, full_name, phone_number, pincode, state, city, house_number, road_area, landmark, address_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, phoneNumber, pincode, state, city, houseNumber, roadArea, landmark, addressType]
    );

    res.status(201).json({ message: "Address added successfully" });
  } catch (err) {
    console.error("Add new address error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAddressList = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const [rows] = await db.query(
      `SELECT 
         id, full_name, phone_number, pincode, state, city, house_number, road_area, landmark, address_type 
       FROM user_addresses 
       WHERE user_id = ?`,
      [userId]
    );

    const addresses = rows.map((addr) => ({
      id: addr.id.toString(),
      fullName: addr.full_name,
      phoneNumber: addr.phone_number,
      pincode: addr.pincode,
      state: addr.state,
      city: addr.city,
      houseNumber: addr.house_number,
      roadArea: addr.road_area,
      landmark: addr.landmark,
      addressType: addr.address_type,
    }));

    res.json(addresses);
  } catch (err) {
    console.error("Get address list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  addNewAddress,
  getAddressList
};
