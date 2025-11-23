const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");

router.post("/bill", auth, adminController.addBill);
router.post("/bill/batch", auth, adminController.addBillBatch);

module.exports = router;
