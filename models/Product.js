const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    jobId: {
        type: String,
        required: true,
        ref: "Job",
    },
    inputImageUrls: [
        {
            type: String,
        },
    ],
    processedImages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProcessedImage",
        },
    ],
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
    },
    error: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Product", ProductSchema);
