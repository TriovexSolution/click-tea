// controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// Signup controller
const signup = async (req, res) => {
  try {
    const { username, email, phone, country_code, password, role, login_type } = req.body;

    // At least email or phone must be provided
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    // Check if user exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    await db.query(
      `INSERT INTO users 
        (username, email, phone, country_code, password, coin, is_subscription, role, status, login_type) 
      VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)`,
      [username, email, phone, country_code, hashedPassword, role, login_type]
    );

    return res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//SignIn Controller 
const signIn = async (req, res) => {
  try {
    const { login_input, password } = req.body;

    if (!login_input || !password) {
      return res.status(400).json({ message: "Login input and password are required" });
    }

    // Find user by email or phone
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [login_input, login_input]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    if (user.status === "banned") {
      return res.status(403).json({ message: "Account is banned" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🛠️ Fetch shopId if role is shop_owner
    let shopId = null;
    if (user.role === "shop_owner") {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [user.id]);
      console.log(shop,"Shop for user");
      
      if (shop.length > 0) {
        shopId = shop[0].id;
      }
    }

    // ✅ Include shopId in token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        shopId: shopId || null, // safely handle null
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    // Respond
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        coin: user.coin,
        shopId, // include it in response if needed
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports ={ 
    signup,
    signIn
}