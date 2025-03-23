const express = require("express");
const router = express.Router();
const { getJobStatus } = require("../controllers/statusController");

router.get("/:jobId", getJobStatus);

module.exports = router;
