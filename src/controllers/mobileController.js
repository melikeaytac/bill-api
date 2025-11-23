const billModel = require("../models/billModel");

async function queryBill(req, res, next) {
  try {
    const { subscriberNo, month } = req.query;

    if (!subscriberNo || !month) {
      return res
        .status(400)
        .json({ message: "subscriberNo and month are required" });
    }

    const bill = await billModel.getBillSummary(subscriberNo, month);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    return res.json({
      total: bill.total_amount,
      paidStatus: bill.is_paid,
    });
  } catch (err) {
    next(err);
  }
}

async function queryBillDetailed(req, res, next) {
  try {
    const { subscriberNo, month } = req.query;
    let { page = 1, size = 10 } = req.query;

    if (!subscriberNo || !month) {
      return res
        .status(400)
        .json({ message: "subscriberNo and month are required" });
    }

    page = parseInt(page, 10);
    size = parseInt(size, 10);
    const offset = (page - 1) * size;

    const details = await billModel.getBillDetails(
      subscriberNo,
      month,
      size,
      offset
    );

    if (!details.length) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const total = details[0].total_amount;

    return res.json({
      total,
      page,
      size,
      details: details.map((d) => ({
        description: d.description,
        amount: d.amount,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  queryBill,
  queryBillDetailed,
};
