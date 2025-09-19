// // controllers/authController.js

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const db = require("../config/db");
// const nodemailer = require("nodemailer");
// // Signup controller
// const signup = async (req, res) => {
//   try {
//     const { username, email, phone, country_code, password, role, login_type } = req.body;

//     // At least email or phone must be provided
//     if (!email && !phone) {
//       return res.status(400).json({ message: "Email or phone is required" });
//     }

//     // Check if user exists
//     const [existingUser] = await db.query(
//       "SELECT * FROM users WHERE email = ? OR phone = ?",
//       [email, phone]
//     );
//     if (existingUser.length > 0) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Insert new user
//     await db.query(
//       `INSERT INTO users 
//         (username, email, phone, country_code, password, coin, is_subscription, role, status, login_type) 
//       VALUES (?, ?, ?, ?, ?, 0, 0, ?, 'active', ?)`,
//       [username, email, phone, country_code, hashedPassword, role, login_type]
//     );

//     return res.status(201).json({ message: "Signup successful" });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// //SignIn Controller 
// const signIn = async (req, res) => {
//   try {
//     const { login_input, password } = req.body;

//     if (!login_input || !password) {
//       return res.status(400).json({ message: "Login input and password are required" });
//     }

//     // Find user by email or phone
//     const [users] = await db.query(
//       "SELECT * FROM users WHERE email = ? OR phone = ?",
//       [login_input, login_input]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = users[0];

//     if (user.status === "banned") {
//       return res.status(403).json({ message: "Account is banned" });
//     }

//     // Validate password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 🛠️ Fetch shopId if role is shop_owner
//     let shopId = null;
//     if (user.role === "shop_owner") {
//       const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [user.id]);
//       console.log(shop,"Shop for user");
      
//       if (shop.length > 0) {
//         shopId = shop[0].id;
//       }
//     }

//     // ✅ Include shopId in token
//     const token = jwt.sign(
//       {
//         id: user.id,
//         role: user.role,
//         shopId: shopId || null, // safely handle null
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Update last login
//     await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

//     // Respond
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         status: user.status,
//         coin: user.coin,
//         shopId, // include it in response if needed
//       },
//     });

//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const requestOtp = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     // Check if user exists
//     const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (users.length === 0) return res.status(404).json({ message: "User not found" });

//     const user = users[0];

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = Date.now() + 5 * 60 * 1000;

//     // Save or update OTP
//     await db.query(
//       `INSERT INTO password_resets (user_id, otp, expires_at)
//        VALUES (?, ?, ?)
//        ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
//       [user.id, otp, expiresAt]
//     );

//     // Send OTP email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Password Reset OTP",
//       text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//     });

//     res.status(200).json({ message: "OTP sent to email" });
//   } catch (err) {
//     console.error("OTP request error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     if (!email || !otp || !newPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (users.length === 0) return res.status(404).json({ message: "User not found" });

//     const user = users[0];

//     // Check OTP
//     const [rows] = await db.query(
//       "SELECT * FROM password_resets WHERE user_id = ? AND otp = ?",
//       [user.id, otp]
//     );
//     if (rows.length === 0) return res.status(400).json({ message: "Invalid OTP" });

//     const resetData = rows[0];
//     if (Date.now() > resetData.expires_at) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
//     await db.query("DELETE FROM password_resets WHERE user_id = ?", [user.id]);

//     res.status(200).json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error("Reset password error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // for logged user to change their password
// const changePassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword } = req.body;

//     if (!oldPassword || !newPassword) {
//       return res.status(400).json({ message: "Old and new password required" });
//     }

//     // Find user from token
//     const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
//     if (users.length === 0) return res.status(404).json({ message: "User not found" });

//     const user = users[0];

//     // Validate old password
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Old password incorrect" });

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (err) {
//     console.error("Change password error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// module.exports ={ 
//     signup,
//     signIn,
//    requestOtp,
//     resetPassword,
//     changePassword
// }
// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");

// Environment variables expected:
// process.env.ACCESS_TOKEN_SECRET
// process.env.REFRESH_TOKEN_SECRET
// process.env.ACCESS_TOKEN_EXPIRES (e.g. "15m")
// process.env.REFRESH_TOKEN_EXPIRES (e.g. "30d")

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET; // fallback to old var
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

// helper token creators
function createAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

// --- Signup controller (unchanged, left as-is)
const signup = async (req, res) => {
  try {
    const { username, email, phone, country_code, password, role, login_type } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }

    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

// --- SignIn: now issues access + refresh token and stores refresh token server-side
const signIn = async (req, res) => {
  try {
    const { login_input, password } = req.body;

    if (!login_input || !password) {
      return res.status(400).json({ message: "Login input and password are required" });
    }

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Fetch shopId if role is shop_owner
    let shopId = null;
    if (user.role === "shop_owner") {
      const [shop] = await db.query("SELECT id FROM shops WHERE owner_id = ?", [user.id]);
      if (shop.length > 0) {
        shopId = shop[0].id;
      }
    }

    // Create tokens (access short lived, refresh long lived)
    const payload = { userId: user.id, role: user.role, shopId: shopId || null };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Persist refresh token in DB (allows revocation/rotation)
    // store expires_at as DATETIME in MySQL: compute expiration date by adding REFRESH_EXPIRES
    // Simpler: use jwt.decode to get exp (seconds since epoch) and store that as expires_at (UNIX)
    const decodedRefresh = jwt.decode(refreshToken) || {};
    const expiresAt = decodedRefresh.exp ? new Date(decodedRefresh.exp * 1000) : null;

    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at, created_at, revoked) VALUES (?, ?, ?, NOW(), 0)",
      [user.id, refreshToken, expiresAt]
    );

    // Update last login
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    // Respond with tokens and safe user object
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        coin: user.coin,
        shopId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Refresh endpoint: accepts { refreshToken }, rotates tokens if valid
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });

    // 1) Verify token signature & payload
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // 2) Check DB for stored refresh token (not revoked)
    const [rows] = await db.query("SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0", [
      refreshToken,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Refresh token not found or revoked" });
    }

    const stored = rows[0];

    // Optionally: check stored.expires_at vs now (jwt.verify already checks expiry)
    // Rotate: revoke/delete existing token and issue new pair
    await db.query("DELETE FROM refresh_tokens WHERE id = ?", [stored.id]);

    const userId = payload.userId ?? payload.id ?? payload.user_id;
    const newPayload = { userId, role: payload.role ?? null, shopId: payload.shopId ?? null };
    const newAccessToken = createAccessToken(newPayload);
    const newRefreshToken = createRefreshToken(newPayload);

    const decodedNewRefresh = jwt.decode(newRefreshToken) || {};
    const newExpiresAt = decodedNewRefresh.exp ? new Date(decodedNewRefresh.exp * 1000) : null;

    await db.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at, created_at, revoked) VALUES (?, ?, ?, NOW(), 0)",
      [userId, newRefreshToken, newExpiresAt]
    );

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- Sign-out: revoke/delete refresh token(s)
// Accepts: { refreshToken } OR if user is authenticated (req.user), revoke all tokens for that user
const signOut = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // delete the specific refresh token row
      await db.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);
      return res.json({ message: "Logged out (token revoked)" });
    }

    // if no refreshToken provided, try to revoke all tokens for current user (requires auth middleware that sets req.user)
    if (req.user && req.user.userId) {
      await db.query("DELETE FROM refresh_tokens WHERE user_id = ?", [req.user.userId]);
      return res.json({ message: "Logged out from all devices" });
    }

    return res.status(400).json({ message: "refreshToken required or authenticated user" });
  } catch (err) {
    console.error("SignOut error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --- OTP + reset + change password (unchanged)
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await db.query(
      `INSERT INTO password_resets (user_id, otp, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
      [user.id, otp, expiresAt]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];

    const [rows] = await db.query(
      "SELECT * FROM password_resets WHERE user_id = ? AND otp = ?",
      [user.id, otp]
    );
    if (rows.length === 0) return res.status(400).json({ message: "Invalid OTP" });

    const resetData = rows[0];
    if (Date.now() > resetData.expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);
    await db.query("DELETE FROM password_resets WHERE user_id = ?", [user.id]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.userId]);
    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id]);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  signIn,
  requestOtp,
  resetPassword,
  changePassword,
  refresh,
  signOut,
};
