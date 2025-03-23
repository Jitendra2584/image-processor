require("dotenv").config();
const app = require("./app");
const { startWorkers } = require("./workers/worker");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

// Start worker threads
startWorkers();

// Start the server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
