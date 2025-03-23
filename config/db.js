const mongoose = require("mongoose");
const logger = require("../utils/logger");

/**
 * Connect to MongoDB
 */
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/image-processor", {});

        logger.info("MongoDB connected");
    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { connectDB };
