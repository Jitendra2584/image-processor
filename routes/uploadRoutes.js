const express = require("express");
const router = express.Router();
const { uploadCsv } = require("../controllers/uploadController");

router.post("/", uploadCsv);

module.exports = router;
