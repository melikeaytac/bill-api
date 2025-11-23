const billModel = require("../models/billModel");

async function addBill(req, res, next) {
  try {
    const { subscriberNo, month, totalAmount } = req.body;

    if (!subscriberNo || !month || totalAmount == null) {
      return res.status(400).json({
        message: "subscriberNo, month and totalAmount are required",
      });
    }

    const id = await billModel.addBill(subscriberNo, month, totalAmount);
    return res.status(201).json({ status: "Success", billId: id });
  } catch (err) {
    next(err);
  }
}

async function addBillBatch(req, res, next) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    const result = await billModel.addBillsBatch(items);

    return res.json({
      status: "Success",
      inserted: result.success,
      failed: result.failed,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addBill,
  addBillBatch,
};
