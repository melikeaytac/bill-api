const billModel = require("../models/billModel");

async function queryBill(req, res, next) {
  try {
    const { subscriberNo } = req.query;

    if (!subscriberNo) {
      return res.status(400).json({ message: "subscriberNo is required" });
    }

    const bills = await billModel.getUnpaidBills(subscriberNo);

    return res.json(
      bills.map((b) => ({
        month: b.month,
        total: b.total_amount,
        paidAmount: b.paid_amount,
        remaining: b.remaining,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  queryBill,
};
