const Queue = require("bull");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

// Create a Bull queue
const imageQueue = new Queue("image-processing", {
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
    },
});

/**
 * Add a product's images to the processing queue
 */
async function addToQueue(productId, jobId) {
    try {
        await imageQueue.add(
            "process-product-images",
            { productId, jobId },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
                removeOnComplete: true,
            }
        );
    } catch (error) {
        logger.error(`Error adding task to queue: ${error.message}`);
        throw error;
    }
}

module.exports = {
    imageQueue,
    addToQueue,
};
