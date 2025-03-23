const { parentPort } = require("worker_threads");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { processImageUrl } = require("../services/imageService");
// Import models here inside the worker thread
const Product = require("../models/Product");
const Job = require("../models/Job");

require("dotenv").config();

// Connect to MongoDB from the worker thread
mongoose
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/image-processor", {})
    .then(() => {
        console.log("Worker thread connected to MongoDB");
    })
    .catch((err) => {
        console.error("Worker thread MongoDB connection error:", err);
        process.exit(1);
    });

// Listen for jobs from the main thread
parentPort.on("message", async (jobData) => {
    try {
        // Convert string productId back to ObjectId if needed
        const { productId, jobId } = jobData;

        // Process the product images
        await processProductImages(typeof productId === "string" ? new ObjectId(productId) : productId, jobId);

        // Send only serializable data back
        parentPort.postMessage({
            success: true,
            productId: productId,
            jobId: jobId,
        });
    } catch (error) {
        console.error(`Worker thread error: ${error.message}`);
        parentPort.postMessage({
            success: false,
            error: {
                message: error.message,
                stack: error.stack,
            },
        });
    }
});

/**
 * Process all images for a given product
 * This is a copy of the function from imageProcessor.js to avoid import issues
 */
async function processProductImages(productId, jobId) {
    try {
        // Get product info
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }

        // Update product status
        product.status = "processing";
        await product.save();

        // Process each image URL
        for (const url of product.inputImageUrls) {
            try {
                // Image processing code here
                // Similar to what's in your imageProcessor.js
                console.log(`Processing image ${url} for product ${product.productName}`);
                await processImageUrl(url, product._id);
                // Implement actual image processing here or import from a utility
            } catch (error) {
                console.error(`Error processing image ${url}: ${error.message}`);
            }
        }

        // Update product status to completed
        product.status = "completed";
        await product.save();

        // Update job progress
        const job = await Job.findOne({ jobId });
        if (job) {
            job.processedItems += 1;
            job.progress = Math.floor((job.processedItems / job.validItems) * 100);

            // If all items processed, mark job as completed
            if (job.processedItems >= job.validItems) {
                job.status = "completed";
            }

            job.updatedAt = new Date();
            await job.save();
        }

        return { success: true };
    } catch (error) {
        // Update product with error
        await Product.findByIdAndUpdate(productId, {
            status: "failed",
            error: error.message,
        });

        console.error(`Error processing product ${productId}: ${error.message}`);
        throw error;
    }
}

// Handle errors
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception in worker thread:", err);
    parentPort.postMessage({
        success: false,
        error: {
            message: err.message,
            stack: err.stack,
        },
    });
});
