const Job = require("../models/Job");
const Product = require("../models/Product");
const logger = require("../utils/logger");

/**
 * Get job status by job ID
 */
async function getJobStatus(req, res) {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({ error: "Job ID is required" });
        }

        const job = await Job.findOne({ jobId });

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Get products for this job
        const products = await Product.find({ jobId }).populate("processedImages");

        return res.status(200).json({
            success: true,
            job: {
                jobId: job.jobId,
                status: job.status,
                progress: job.progress,
                totalItems: job.totalItems,
                processedItems: job.processedItems,
                createdAt: job.createdAt,
                updatedAt: job.updatedAt,
            },
            products: products.map((product) => ({
                id: product._id,
                serialNumber: product.serialNumber,
                productName: product.productName,
                status: product.status,
                imagesProcessed: product.processedImages.length,
                totalImages: product.inputImageUrls.length,
            })),
        });
    } catch (error) {
        logger.error(`Error in getJobStatus controller: ${error.message}`);
        return res.status(500).json({ error: "Server error checking job status" });
    }
}

module.exports = {
    getJobStatus,
};
