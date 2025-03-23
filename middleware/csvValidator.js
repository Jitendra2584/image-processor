const csv = require("csv-parser");
const fs = require("fs");
const logger = require("../utils/logger");

/**
 * Validate CSV file format
 */
function validateCsv(req, res, next) {
    if (!req.file) {
        return next();
    }

    const requiredHeaders = ["Serial Number", "Product Name", "Input Image Urls"];
    const headers = [];
    let isValid = true;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("headers", (headersList) => {
            headers.push(...headersList);

            // Check if all required headers exist
            for (const requiredHeader of requiredHeaders) {
                if (!headers.includes(requiredHeader)) {
                    isValid = false;
                    logger.error(`Missing required header: ${requiredHeader}`);
                }
            }
        })
        .on("data", (row) => {
            // We only need to check headers, so end the stream after first row
            // This is more efficient than reading the whole file
        })
        .on("end", () => {
            if (!isValid) {
                return res.status(400).json({
                    error: "Invalid CSV format. Required columns: Serial Number, Product Name, Input Image Urls",
                });
            }
            next();
        })
        .on("error", (error) => {
            logger.error(`Error validating CSV: ${error.message}`);
            return res.status(400).json({ error: "Error parsing CSV file" });
        });
}

module.exports = validateCsv;
