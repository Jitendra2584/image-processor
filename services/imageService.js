const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const ProcessedImage = require("../models/ProcessedImage");
const Product = require("../models/Product");
const logger = require("../utils/logger");

/**
 * Download an image from a URL
 */
async function downloadImage(url) {
    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "arraybuffer",
        });

        return response.data;
    } catch (error) {
        logger.error(`Error downloading image from ${url}: ${error.message}`);
        throw error;
    }
}

/**
 * Compress an image by 50% quality
 */
async function compressImage(imageBuffer, outputPath) {
    try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Process the image - reduce quality by 50%
        await sharp(imageBuffer).jpeg({ quality: 50 }).toFile(outputPath);

        return outputPath;
    } catch (error) {
        logger.error(`Error compressing image: ${error.message}`);
        throw error;
    }
}

/**
 * Process a single image URL for a product
 */
async function processImageUrl(url, productId) {
    try {
        // Generate unique filename
        const filename = `${uuidv4()}${path.extname(url.split("?")[0]) || ".jpg"}`;
        const outputPath = path.join("processed", filename);

        // Download and process image
        const imageBuffer = await downloadImage(url);
        await compressImage(imageBuffer, outputPath);

        // Save processed image record
        const processedImage = new ProcessedImage({
            originalUrl: url,
            processedPath: outputPath,
            productId,
            compressionRatio: 50,
        });

        await processedImage.save();

        // Update product with processed image reference
        await Product.findByIdAndUpdate(productId, {
            $push: { processedImages: processedImage._id },
        });

        return processedImage;
    } catch (error) {
        logger.error(`Error processing image URL ${url}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    processImageUrl,
    downloadImage,
    compressImage,
};
