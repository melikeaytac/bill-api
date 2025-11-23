const billModel = require("../models/billModel");

async function payBill(req, res, next) {
  try {
    const { subscriberNo, month, amount } = req.body;

    if (!subscriberNo || !month || amount == null) {
      return res
        .status(400)
        .json({ message: "subscriberNo, month and amount are required" });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "amount must be > 0" });
    }

    const result = await billModel.payBill(
      subscriberNo,
      month,
      numericAmount
    );

    if (result.status === "NOT_FOUND") {
      return res.status(404).json({ status: "Error", message: "Bill not found" });
    }

    return res.json({
      status: "Successful",
      isPaid: result.isPaid,
      total: result.total,
      paidAmount: result.paidAmount,
      remaining: result.remaining,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  payBill,
};
