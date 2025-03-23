const logger = require("../utils/logger");

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    logger.error(`Error: ${err.message}`);

    // Handle multer file size errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            error: "File too large",
        });
    }

    // Handle other errors
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || "Internal Server Error",
    });
}

module.exports = errorHandler;
