const mongoose = require("mongoose");

const ProcessedImageSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    processedPath: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    compressionRatio: {
        type: Number,
        default: 50,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("ProcessedImage", ProcessedImageSchema);
