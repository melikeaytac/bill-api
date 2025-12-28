const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");
const auth = require("../middleware/auth");

router.get("/bill", auth, bankController.queryBill);

module.exports = router;
