# Image Processor App Function Documentation

This document provides details about the key functions used throughout the image processor application, organized by module.

## Server & App Initialization

### `connectDB()`

**Location:** `config/db.js`
**Purpose:** Establishes connection to MongoDB database
**Description:** Attempts to connect to the MongoDB instance using the URI from environment variables, logs success or failure, and exits the process on connection error.

### `startWorkers()`

**Location:** `workers/worker.js`
**Purpose:** Initializes worker threads for image processing
**Description:** Creates a pool of worker threads (one less than available CPU cores) to process images concurrently. Distributes jobs to workers using a round-robin approach.

## Controllers

### `uploadCsv(req, res)`

**Location:** `controllers/uploadController.js`
**Purpose:** Handles CSV file uploads
**Description:** Validates that a file was uploaded, processes the CSV file by calling the `processCSV` service, and returns the job ID to the client.

### `getJobStatus(req, res)`

**Location:** `controllers/statusController.js`
**Purpose:** Retrieves processing status for a job
**Description:** Fetches job and associated product information by job ID, including progress statistics and processed image counts.

## CSV Processing

### `processCSV(filePath)`

**Location:** `services/csvService.js`
**Purpose:** Processes a CSV file containing product data
**Description:** Creates a new job, reads the CSV file row by row, validates the data, creates product records, and queues image processing tasks for each product.

## Queue Management

### `addToQueue(productId, jobId)`

**Location:** `services/queueService.js`
**Purpose:** Adds a product's images to the processing queue
**Description:** Enqueues a product processing task with the Bull queue system, configuring retry behavior and backoff settings.

## Image Processing

### `downloadImage(url)`

**Location:** `services/imageService.js`
**Purpose:** Downloads an image from a URL
**Description:** Fetches an image from a remote URL using axios and returns it as an array buffer.

### `compressImage(imageBuffer, outputPath)`

**Location:** `services/imageService.js`
**Purpose:** Compresses an image to reduce file size
**Description:** Uses Sharp to compress the image by reducing quality to 50%, creates output directories if needed, and saves the processed image.

### `processImageUrl(url, productId)`

**Location:** `services/imageService.js`
**Purpose:** Processes a single image URL for a product
**Description:** Downloads the image, compresses it, creates a ProcessedImage record, and updates the product with the reference to the processed image.

## Worker Thread Management

### `processProductImages(productId, jobId)`

**Location:** `workers/workerThread.js`
**Purpose:** Processes all images for a given product
**Description:** Retrieves product information, updates its status to "processing", processes each image URL, updates the product status to "completed", and updates the job progress.

## Error Handling

### `errorHandler(err, req, res, next)` (implied middleware)

**Location:** `middleware/errorHandler.js`
**Purpose:** Centralized error handling for API routes
**Description:** Catches and formats errors from route handlers, logging details and returning appropriate error responses.

## Logging

### `logger`

**Location:** `utils/logger.js`
**Purpose:** Application-wide logging utility
**Description:** Configures Winston for logging application events to console and files, with different severity levels and formatted output.

## Data Model Functions (Implied from Usage)

### `Job.findOne()`, `Job.findOneAndUpdate()`

**Location:** Models used throughout application
**Purpose:** Retrieve and update job records
**Description:** MongoDB operations for finding and modifying job documents, tracking processing status and progress.

### `Product.find()`, `Product.findById()`, `Product.findByIdAndUpdate()`

**Location:** Models used throughout application
**Purpose:** Manage product records
**Description:** MongoDB operations for creating, finding, and updating product documents, including population of related processed images.

### `ProcessedImage.save()`

**Location:** Models used throughout application
**Purpose:** Create processed image records
**Description:** Stores information about processed images, including original URL, processed file path, and compression ratio.
