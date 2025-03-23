# Worker System Documentation

## Worker Manager (`worker.js`)

The `worker.js` file serves as the coordinator for all worker threads in the application. It creates and manages a pool of worker threads and distributes image processing jobs among them.

### Key Functions

#### `startWorkers()`

**Purpose:** Initialize a pool of worker threads for parallel image processing
**Implementation Details:**

-   Creates multiple worker threads (one less than available CPU cores)
-   Sets up error handling for each worker
-   Configures the Bull queue to distribute jobs across workers
-   Uses round-robin distribution for load balancing

### Worker Pool Management

The file creates a pool of workers based on the available CPU cores on the system (CPU count - 1). This approach ensures:

-   Optimal resource utilization
-   One CPU core remains available for the main Node.js event loop
-   System responsiveness during heavy processing

### Job Distribution System

Jobs are distributed to workers using a round-robin approach:

-   Each new job is sent to the next worker in sequence
-   When the end of the worker array is reached, distribution cycles back to the first worker
-   This simple approach provides reasonable load balancing without overhead

### Alternative Implementation (Commented Code)

The file contains a commented-out implementation that processes jobs directly using bull workers:

```javascript
// Process jobs in the bull workers (simpler approach)
// imageQueue.process("process-product-images", async (job) => {
//     try {
//         const { productId, jobId } = job.data;
//         return await processProductImages(productId, jobId);
//     } catch (error) {
//         logger.error(`Worker error: ${error.message}`);
//         throw error;
//     }
// });
```

This alternative approach:

-   Processes jobs directly in the bull workers instead of worker threads
-   Is simpler to implement but doesn't utilize multiple CPU cores
-   Would be suitable for low cpu intensive tasks.
-   Sacrifices the performance benefits of parallel processing

## Worker Thread Implementation (`workerThread.js`)

The `workerThread.js` file contains the actual worker thread that processes images. Each worker:

### Thread Initialization

-   Establishes its own MongoDB connection
-   Sets up message handlers to receive jobs
-   Configures error handling

### Key Functions

#### `processProductImages(productId, jobId)`

**Purpose:** Process all images for a given product
**Implementation Details:**

-   Retrieves product information from the database
-   Updates product status to "processing"
-   Iterates through each image URL in the product
-   Processes each image using the image service
-   Updates product status to "completed" when finished
-   Updates job progress in the database
-   Handles errors and updates product status accordingly

### Communication Pattern

The worker thread uses a simple message-based communication pattern:

-   Receives job data from the main thread via `parentPort.on("message")`
-   Processes the job asynchronously
-   Sends results back to the main thread via `parentPort.postMessage()`
-   Ensures only serializable data is passed between threads

### Error Handling

The worker implements multiple error handling strategies:

-   Try/catch blocks around individual image processing
-   Error handling for the entire product processing flow
-   Global uncaught exception handler to prevent thread crashes

## Efficiency Considerations

### Performance Benefits

1. **Parallel Processing:** Multiple images can be processed simultaneously across different CPU cores
2. **Isolation:** Worker threads have their own memory space, preventing memory leaks from affecting the main application
3. **Scalability:** The number of workers automatically adjusts to the available CPU resources

### Resource Management

1. **CPU Utilization:** Uses (N-1) CPU cores for workers, leaving one core for the main Node.js event loop
2. **Connection Pooling:** Each worker maintains its own MongoDB connection
3. **Thread Safety:** Worker threads operate independently, avoiding race conditions

### Load Balancing

The round-robin job distribution provides several benefits:

1. **Simplicity:** Easy to implement and maintain
2. **Fairness:** Each worker gets approximately the same number of jobs
3. **Low Overhead:** Minimal computational cost for job assignment

### Fault Tolerance

1. **Job Recovery:** If a worker fails, the Bull queue can retry the job
2. **Individual Task Isolation:** Failure in one image processing task doesn't affect others
3. **Error Reporting:** Comprehensive error logging facilitates debugging
