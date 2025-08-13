const db = require("../config/db");

// ✅ 1. Add Feedback (only if not already given)
const addFeedback = async (req, res) => {
  try {
    const { menuId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if already given
    const [existing] = await db.query(
      "SELECT * FROM menu_feedback WHERE menuId = ? AND userId = ?",
      [menuId, userId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "You’ve already given feedback on this menu" });
    }

    await db.query(
      `INSERT INTO menu_feedback (menuId, userId, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [menuId, userId, rating, comment]
    );

    res.status(201).json({ message: "Feedback submitted" });
  } catch (err) {
    console.error("Add feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 2. Edit Feedback (only once if allowed)
const editFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check permission
    const [feedback] = await db.query(
      `SELECT * FROM menu_feedback 
       WHERE feedbackId = ? AND userId = ?`,
      [feedbackId, userId]
    );

    if (feedback.length === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback[0].canEdit === 0) {
      return res.status(403).json({ message: "You can't edit this feedback anymore" });
    }

    // Update feedback & lock edit
    await db.query(
      `UPDATE menu_feedback 
       SET rating = ?, comment = ?, canEdit = 0 
       WHERE feedbackId = ?`,
      [rating, comment, feedbackId]
    );

    res.status(200).json({ message: "Feedback updated once and locked" });
  } catch (err) {
    console.error("Edit feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 3. Get Feedbacks by Menu (admin/shop_owner/user)
const getFeedbacksByMenu = async (req, res) => {
  try {
    const { menuId } = req.params;

    const [feedbacks] = await db.query(
      `SELECT f.*, u.username 
       FROM menu_feedback f
       JOIN users u ON f.userId = u.id
       WHERE f.menuId = ?`,
      [menuId]
    );

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Get feedbacks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFeedback,
  editFeedback,
  getFeedbacksByMenu,
};
