const fs = require("fs");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const Job = require("../models/Job");
const Product = require("../models/Product");
const { addToQueue } = require("./queueService");
const logger = require("../utils/logger");

/**
 * Process a CSV file and queue image processing jobs
 */
async function processCSV(filePath) {
    // Create a new job with unique ID
    const jobId = uuidv4();

    try {
        const job = new Job({
            jobId,
            status: "pending",
        });

        await job.save();

        // Read and process the CSV file
        const products = [];
        let rowCount = 0;
        let validCount = 0;

        const parsePromise = new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", async (row) => {
                    rowCount++;
                    // Validate row data
                    if (!row["Serial Number"] || !row["Product Name"]) {
                        logger.error(`Invalid row data in CSV: ${JSON.stringify(row)}`);
                        return;
                    }

                    validCount += 1;

                    // Parse image URLs with HTTPS validation
                    const imageUrls = row["Input Image Urls"]
                        ? row["Input Image Urls"]
                              .split(",")
                              .map((url) => url.trim())
                              .filter((url) => {
                                  // Validate URL is  HTTPS
                                  try {
                                      const parsedUrl = new URL(url);
                                      return parsedUrl.protocol === "https:";
                                  } catch (e) {
                                      logger.warn(`Invalid URL skipped: ${url}`);
                                      return false;
                                  }
                              })
                        : [];

                    // Create product record
                    const product = new Product({
                        serialNumber: row["Serial Number"],
                        productName: row["Product Name"],
                        inputImageUrls: imageUrls,
                        jobId: jobId,
                    });

                    await product.save();
                    products.push(product);
                })
                .on("end", () => {
                    resolve(rowCount);
                })
                .on("error", (error) => {
                    reject(error);
                });
        });

        // Wait for CSV parsing to complete
        const totalItems = await parsePromise;

        // Update job with total count
        await Job.findOneAndUpdate(
            { jobId },
            {
                status: "processing",
                totalItems,
                validItems: validCount,
            }
        );

        // Queue processing for each product
        for (const product of products) {
            await addToQueue(product._id, jobId);
        }

        return jobId;
    } catch (error) {
        // Update job with error
        await Job.findOneAndUpdate(
            { jobId },
            {
                status: "failed",
                error: error.message,
            }
        );

        logger.error(`Error processing CSV: ${error.message}`);
        throw error;
    }
}

module.exports = {
    processCSV,
};
