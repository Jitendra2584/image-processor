# Database Models

## Job Model

The Job model tracks the overall progress of a CSV processing operation.

```javascript
{
  jobId: String,        // Unique identifier for the job (UUID)
  status: String,       // "pending", "processing", "completed", or "failed"
  progress: Number,     // Percentage completion (0-100)
  totalItems: Number,   // Total number of products in the job
  validItems: Number,   // Number of valid products in the job
  processedItems: Number, // Number of products processed so far
  error: String,        // Error message if job fails
  createdAt: Date,      // When the job was created
  updatedAt: Date       // When the job was last updated
}
```

## Product Model

The Product model stores information about products extracted from the CSV file.

```javascript
{
  serialNumber: String,  // Product's unique identifier from the CSV
  productName: String,   // Name of the product
  jobId: String,         // Reference to the parent job
  inputImageUrls: [String], // Array of image URLs to be processed
  processedImages: [ObjectId], // References to ProcessedImage documents
  status: String,        // "pending", "processing", "completed", or "failed"
  error: String,         // Error message if processing fails
  createdAt: Date        // When the product was added to the database
}
```

## ProcessedImage Model

The ProcessedImage model tracks each individual image that has been processed.

```javascript
{
  originalUrl: String,   // Original URL of the image
  processedPath: String, // Path where the processed image is stored
  productId: ObjectId,   // Reference to the parent product
  compressionRatio: Number, // Percentage the image was compressed (default: 50%)
  createdAt: Date        // When the image was processed
}
```
