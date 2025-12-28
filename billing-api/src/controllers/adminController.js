const billModel = require("../models/billModel");
const { parse } = require("csv-parse/sync");

async function addBill(req, res, next) {
  try {
    const { subscriberNo, month, totalAmount, paidAmount } = req.body;

    if (!subscriberNo || !month || totalAmount == null) {
      return res.status(400).json({
        message: "subscriberNo, month and totalAmount are required",
      });
    }

    const initialPaid =
      paidAmount !== undefined && paidAmount !== null
        ? Number(paidAmount)
        : 0;

    const id = await billModel.addBill(
      subscriberNo,
      month,
      Number(totalAmount),
      initialPaid
    );

    return res.status(201).json({ status: "Success", billId: id });
  } catch (err) {
    next(err);
  }
}

async function addBillBatch(req, res, next) {
  try {
    let items = [];

    // 1) CSV geldi mi?
    if (req.file && req.file.buffer) {
      const csvText = req.file.buffer.toString("utf-8");

      let records;
      try {
        records = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
      } catch (parseErr) {
        console.error("CSV parse error", parseErr);
        return res.status(400).json({ message: "Invalid CSV file" });
      }

      for (const row of records) {
        const subscriberNo =
          row.subscriberNo ||
          row.SubscriberNo ||
          row["Subscriber No"] ||
          row["subscriber_no"];

        const month = row.month || row.Month || row.Months || row["Months"];

        const totalAmountRaw =
          row.totalAmount || row.TotalAmount || row.Amount || row["Total"];
        const totalAmount =
          totalAmountRaw !== undefined && totalAmountRaw !== ""
            ? Number(totalAmountRaw)
            : null;

        const paidAmountRaw =
          row.paidAmount || row.PaidAmount || row["PaidAmount"];
        const paidAmount =
          paidAmountRaw !== undefined && paidAmountRaw !== ""
            ? Number(paidAmountRaw)
            : 0;

        if (
          !subscriberNo ||
          !month ||
          totalAmount == null ||
          Number.isNaN(totalAmount)
        ) {
          // Geçersiz satırı atla
          continue;
        }

        items.push({ subscriberNo, month, totalAmount, paidAmount });
      }

      if (items.length === 0) {
        return res
          .status(400)
          .json({ message: "no valid rows found in CSV file" });
      }
    } else {
      // 2) JSON batch (mevcut davranış)
      const bodyItems = Array.isArray(req.body.items)
        ? req.body.items
        : Array.isArray(req.body)
        ? req.body
        : null;

      if (!Array.isArray(bodyItems)) {
        return res.status(400).json({
          message: "items must be an array or CSV file must be provided",
        });
      }

      items = bodyItems;
    }

    const { success, failed } = await billModel.addBillsBatch(items);

    return res.status(201).json({
      status: "Success",
      inserted: success,
      failed,
    });
  } catch (err) {
    console.error("addBillBatch error", err);
    next(err);
  }
}

module.exports = {
  addBill,
  addBillBatch,
};
