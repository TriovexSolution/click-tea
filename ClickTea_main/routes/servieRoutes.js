const express = require("express");
const router = express.Router();
const { checkServiceAvailability } = require("../controllers/serviceController");

router.get("/availability", checkServiceAvailability);

module.exports = router;
