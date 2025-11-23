const express = require("express");
const router = express.Router();
const webController = require("../controllers/webController");

router.post("/pay", webController.payBill);

module.exports = router;
