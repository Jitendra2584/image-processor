const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { connectDB } = require("./config/db");
const uploadRoutes = require("./routes/uploadRoutes");
const statusRoutes = require("./routes/statusRoutes");
const errorHandler = require("./middleware/errorHandler");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "text/csv") {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"), false);
        }
    },
});

// Add multer middleware to app
app.use(upload.single("file"));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
