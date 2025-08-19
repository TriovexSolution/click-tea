const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const app = express();
const authRoutes = require("./routes/authRoutes")
const shopRoutes = require("./routes/shopRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const menuRoutes = require("./routes/menuRoutes")
const orderRoutes = require("./routes/orderRoutes")
const menuAddonsRoutes = require("./routes/menuAddonsRoutes")
const favouritesRoutes = require("./routes/favouriteRoutes")
const userRoutes = require("./routes/userRoutes")
const cartRoutes = require('./routes/cartRoutes')
const coinRoutes = require("./routes/coinRoutes")
const addressRoutes = require("./routes/addressRoutes")
const serviceRoutes = require("./routes/servieRoutes");
// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/shops",shopRoutes);
app.use("/api/category",categoryRoutes);
app.use("/api/menu",menuRoutes);
app.use("/api/orders",orderRoutes)
app.use("/api/menu-addons",menuAddonsRoutes);
app.use("/api/favourites",favouritesRoutes);
app.use("/api/profile",userRoutes)
app.use("/api/cart",cartRoutes)
  // app.use("/api/profile",userRoutes)
  app.use("/api/coin",coinRoutes)
app.use("/api/address",addressRoutes)
app.use("/api/service", serviceRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ClickTea_Main Server is running on port ${PORT}`);
});
