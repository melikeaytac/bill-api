const express = require("express");
const router = express.Router();
const mobileController = require("../controllers/mobileController");
const auth = require("../middleware/auth");

router.get("/bill", mobileController.queryBill);
router.get("/bill/detailed", mobileController.queryBillDetailed);

module.exports = router;
