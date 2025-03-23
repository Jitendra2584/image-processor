const { Worker } = require("worker_threads");
const path = require("path");
const os = require("os");
const { imageQueue } = require("../services/queueService");
const { processImageUrl } = require("../services/imageService");
const logger = require("../utils/logger");

// Determine number of worker threads (1 less than CPU cores, minimum 1)
const numWorkers = Math.max(1, os.cpus().length - 1);
const workers = [];

/**
 * Start worker threads for processing images
 */
function startWorkers() {
    logger.info(`Starting ${numWorkers} worker threads`);

    // Process jobs in the main thread (simpler approach)
    // imageQueue.process("process-product-images", async (job) => {
    //     try {
    //         const { productId, jobId } = job.data;
    //         return await processProductImages(productId, jobId);
    //     } catch (error) {
    //         logger.error(`Worker error: ${error.message}`);
    //         throw error;
    //     }
    // });

    // Alternative: Use actual worker threads for better isolation
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(path.join(__dirname, "workerThread.js"));
        workers.push(worker);

        worker.on("error", (err) => {
            logger.error(`Worker ${i} error: ${err}`);
        });
    }

    // Distribute jobs to workers using round-robin
    let workerIndex = 0;
    imageQueue.process("process-product-images", (job) => {
        const worker = workers[workerIndex];
        workerIndex = (workerIndex + 1) % numWorkers;

        // Send job to worker
        return new Promise((resolve, reject) => {
            worker.postMessage(job.data);
            worker.once("message", resolve);
            worker.once("error", reject);
        });
    });
}

module.exports = {
    startWorkers,
};
