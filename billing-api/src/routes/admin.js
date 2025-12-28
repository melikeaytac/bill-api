const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/bill", auth, adminController.addBill);

router.post(
    "/bill/batch",
    auth,
    upload.single("file"),
    adminController.addBillBatch
);

module.exports = router;
