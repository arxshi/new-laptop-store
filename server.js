require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Order = require('./models/Order');

// Models
const User = require("./models/User");
const Laptop = require("./models/Laptop");

// Routes
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const {response} = require("express");

// Middleware
app.use(express.json());
app.use(cors({
    origin: "https://new-laptop-store-5ti4ve14m-tamerlans-projects-4d7c08e1.vercel.app/",
    credentials: true
}));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(" MongoDB Connection Error:", err));

// Serve static files
app.use(express.static("public"));

app.get("/public", (req, res) => {
    res.sendFile(path.join(__dirname, "/public"));
})

// Use Routes
app.use("/api", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
});

// Admin Dashboard UI
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/admin.html"));  // Serve Admin Panel UI
});

app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/cart.html"));
})

// Get Laptops
app.get("/api/laptops", async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { brand: { $regex: search, $options: "i" } },      // Search by brand
                { model: { $regex: search, $options: "i" } },      // Search by model
                { processor: { $regex: search, $options: "i" } },  // Search by processor
                { storage: { $regex: search, $options: "i" } },    // Search by storage
                { graphics: { $regex: search, $options: "i" } }    // Search by graphics
            ];
        }

        const laptops = await Laptop.find(query);
        return res.json(laptops);
    } catch (error) {
        next(error);
    }
});


// Global Error Handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err);
    if (!response.headersSent) {
        response.status(500).json({ error: "Internal Server Error" });
    }
});


// Start Server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    
