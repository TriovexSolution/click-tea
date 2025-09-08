const multer = require("multer");
const path = require("path");
const fs = require("fs");

// const getFolderFromRoute = (req) => {
//   if (req.originalUrl.includes("/category")) return "uploads/categories/";
//   if (req.originalUrl.includes("/menu")) return "uploads/menus/";
//   return "uploads/shops/";
// };
const getFolderFromRoute = (req) => {
  if (req.originalUrl.includes("/category")) return "uploads/categories/";
  if (req.originalUrl.includes("/menu")) return "uploads/menus/";
  if (req.originalUrl.includes("/user")) return "uploads/users/";  // ✅ for user profile images
  return "uploads/shops/";
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = getFolderFromRoute(req);
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) return cb(null, true);
  cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
