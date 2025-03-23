const { processCSV } = require("../services/csvService");
const logger = require("../utils/logger");

/**
 * Handle CSV file upload and start processing
 */
async function uploadCsv(req, res) {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: "No CSV file uploaded" });
        }

        // Process the CSV file
        const jobId = await processCSV(req.file.path);

        // Return job ID to client
        return res.status(200).json({
            success: true,
            message: "CSV file uploaded and processing started",
            jobId,
        });
    } catch (error) {
        logger.error(`Error in uploadCsv controller: ${error.message}`);
        return res.status(500).json({ error: "Server error processing CSV file" });
    }
}

module.exports = {
    uploadCsv,
};
