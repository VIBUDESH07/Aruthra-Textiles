require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/materials", require("./routes/MaterialRoutes"));
app.use("/api/sales",require("./routes/sellRoutes"))
app.use("/api/reports",require("./routes/reportRoutes"))
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
