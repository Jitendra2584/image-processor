# Image Processor App

A robust Node.js application for processing, optimizing, and storing images in bulk through CSV uploads.

## Overview

The Image Processor App efficiently handles bulk image processing operations. It accepts CSV files containing product information and image URLs, processes those images in parallel using worker threads, and provides a status API to track processing progress.

## Features

-   CSV file upload and validation
-   Parallel image processing using worker threads
-   Queue-based architecture with Redis for scalability
-   Image optimization with Sharp
-   Progress tracking through status API
-   Error handling and logging

## System Architecture

The application consists of several key components:

1. **Express Server**: Handles HTTP requests, file uploads, and status checks
2. **Bull Queue**: Manages background processing tasks
3. **Worker Threads**: Perform CPU-intensive image processing operations
4. **MongoDB**: Stores job, product, and processed image data
5. **Redis**: Powers the Bull queue for reliable job processing

## Flow

1. Client uploads a CSV file with product data and image URLs
2. Server validates the CSV format and content
3. A new job is created and products are added to the database
4. Image processing tasks are queued for each product
5. Worker threads process images in parallel
6. Client can check job status through the API

## API Endpoints

### Upload CSV

#### POST /api/upload

Upload a CSV file containing product data and image URLs.

**Request:**

-   Content-Type: multipart/form-data
-   Body: file (CSV file)


# Uploading a File using Postman (form-data)

Follow these steps to upload a file using Postman with the `form-data` body type:

## Steps:

1. **Set up the Request:**
   - Open Postman.
   - Set the HTTP method to `POST` (or the appropriate method for your API).
   - Enter the API endpoint URL.

2. **Set Body to `form-data`:**
   - Go to the **Body** tab in Postman.
   - Select the **form-data** option.

3. **Add the File Upload Field:**
   - Under the **Key** column, enter the key that the API expects for file uploads (e.g., `file` or `upload`).
   - In the **Value** column, select `File` from the dropdown.
   - Click **Select Files** to choose the file you want to upload.

4. **Send the Request:**
   - Once the file is selected, click **Send** to submit the request to the API.

**Response:**

```json
{
    "success": true,
    "message": "CSV file uploaded and processing started",
    "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

all updated images are stored under processed folder.
all csv files requested for are stored under uploads folder

### Check Job Status

#### GET /api/status/:jobId

Check the current status of a processing job.

**Response:**

```json
{
    "success": true,
    "job": {
        "jobId": "b8b33c8b-e863-4878-b5fb-914ca7ca1127",
        "status": "completed",
        "progress": 100,
        "totalItems": 2,
        "processedItems": 2,
        "createdAt": "2025-03-23T20:39:10.511Z",
        "updatedAt": "2025-03-23T20:39:11.032Z"
    },
    "products": [
        {
            "id": "67e0716e777244ec92a5b805",
            "serialNumber": "1",
            "productName": "SKU1",
            "status": "completed",
            "imagesProcessed": 2,
            "totalImages": 2
        },
        {
            "id": "67e0716e777244ec92a5b806",
            "serialNumber": "2",
            "productName": "SKU2",
            "status": "completed",
            "imagesProcessed": 1,
            "totalImages": 1
        }
    ]
}
```

**Response Field Definitions:**

-   `status`: Current processing status (pending, processing, completed, failed)
-   `progress`: Percentage of completion (0-100)
-   `totalItems`: Total number of items to be processed
-   `processedItems`: Number of items that have been processed so far

## CSV File Format

The application expects CSV files with the following columns:

-   **Serial Number**: Unique identifier for the product
-   **Product Name**: Name of the product
-   **Input Image Urls**: Comma-separated list of image URLs (must be enclosed in quotes if multiple)

Example:

```csv
Serial Number,Product Name,Input Image Urls
1001,Premium Watch,"https://example.com/watch1.jpg,https://example.com/watch2.jpg"
1002,Designer Bag,https://example.com/bag.jpg
```

## Technical Implementation

### Key Components:

-   `app.js`: Main Express application setup
-   `server.js`: Server entry point
-   `csvService.js`: Handles CSV parsing and validation
-   `imageService.js`: Image processing logic
-   `queueService.js`: Bull queue configuration
-   `worker.js`: Worker thread management

### Models:

-   **Job**: Tracks overall processing job
-   **Product**: Stores product data including image URLs
-   **ProcessedImage**: Tracks processed image metadata

## Setup and Installation

### Prerequisites

-   Node.js (v14+)
-   MongoDB
-   Redis

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/image-processor-app.git
cd image-processor-app

# Install dependencies
npm install

# run redis via docker(best way)
docker run -d -p 6379:6379 redis

# run mongo via docker
docker run -d -p 27017:27017 --name mongodb mongo


# directly run server in docker
docker compose up -d  --build


# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables (.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/image-processor
REDIS_HOST=localhost
REDIS_PORT=6379
STORAGE_PATH=./processed
```

### Running the Application

```bash
# Start in production mode
npm start

# Start in development mode with auto-restart
npm run dev
```

## Error Handling

The application implements comprehensive error handling:

-   CSV validation errors
-   Network failures when downloading images
-   Image processing errors
-   Database connectivity issues

## Monitoring and Logging

-   All processing operations are logged for debugging
-   Bull Dashboard available at `/admin/queues` for monitoring jobs
-   Performance metrics tracked for optimization

## Future Enhancements

-   Support for more image processing operations (filters, watermarks)
-   AWS S3 integration for image storage
-   Webhook notifications for job completion
-   User authentication and authorization
