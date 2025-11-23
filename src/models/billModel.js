const db = require("../db");

async function getBillSummary(subscriberNo, month) {
  const result = await db.query(
    `
    SELECT b.id,
           b.total_amount,
           b.paid_amount,
           (b.paid_amount >= b.total_amount) AS is_paid
    FROM bills b
    JOIN subscribers s ON s.id = b.subscriber_id
    WHERE s.subscriber_no = $1 AND b.month = $2
    LIMIT 1
    `,
    [subscriberNo, month]
  );

  return result.rows[0] || null;
}

async function getBillDetails(subscriberNo, month, limit, offset) {
  const result = await db.query(
    `
    SELECT b.total_amount,
           bd.description,
           bd.amount
    FROM bills b
    JOIN subscribers s ON s.id = b.subscriber_id
    JOIN bill_details bd ON bd.bill_id = b.id
    WHERE s.subscriber_no = $1 AND b.month = $2
    ORDER BY bd.id
    LIMIT $3 OFFSET $4
    `,
    [subscriberNo, month, limit, offset]
  );

  return result.rows;
}

async function getUnpaidBills(subscriberNo) {
  const result = await db.query(
    `
    SELECT b.month,
           b.total_amount,
           b.paid_amount,
           (b.total_amount - b.paid_amount) AS remaining
    FROM bills b
    JOIN subscribers s ON s.id = b.subscriber_id
    WHERE s.subscriber_no = $1
      AND b.paid_amount < b.total_amount
    ORDER BY b.month DESC
    `,
    [subscriberNo]
  );

  return result.rows;
}

async function payBill(subscriberNo, month, amount) {
  const client = await db.query("BEGIN");
  try {
    const billRes = await db.query(
      `
      SELECT b.id, b.total_amount, b.paid_amount
      FROM bills b
      JOIN subscribers s ON s.id = b.subscriber_id
      WHERE s.subscriber_no = $1 AND b.month = $2
      FOR UPDATE
      `,
      [subscriberNo, month]
    );

    if (billRes.rowCount === 0) {
      await db.query("ROLLBACK");
      return { status: "NOT_FOUND" };
    }

    const bill = billRes.rows[0];
    const newPaid = bill.paid_amount + amount;

    await db.query(
      `
      UPDATE bills
      SET paid_amount = $1
      WHERE id = $2
      `,
      [newPaid, bill.id]
    );

    await db.query("COMMIT");

    const isPaid = newPaid >= bill.total_amount;

    return {
      status: "SUCCESS",
      isPaid,
      total: bill.total_amount,
      paidAmount: newPaid,
      remaining: Math.max(bill.total_amount - newPaid, 0),
    };
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

async function getOrCreateSubscriber(subscriberNo) {
  const existing = await db.query(
    "SELECT id FROM subscribers WHERE subscriber_no = $1",
    [subscriberNo]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0].id;
  }

  const inserted = await db.query(
    `
    INSERT INTO subscribers (subscriber_no, created_at)
    VALUES ($1, NOW())
    RETURNING id
    `,
    [subscriberNo]
  );

  return inserted.rows[0].id;
}

async function addBill(subscriberNo, month, totalAmount) {
  const subscriberId = await getOrCreateSubscriber(subscriberNo);

  const inserted = await db.query(
    `
    INSERT INTO bills (subscriber_id, month, total_amount, paid_amount)
    VALUES ($1, $2, $3, 0)
    RETURNING id
    `,
    [subscriberId, month, totalAmount]
  );

  return inserted.rows[0].id;
}

async function addBillsBatch(items) {
  let success = 0;
  let failed = 0;

  for (const item of items) {
    const { subscriberNo, month, totalAmount } = item;
    if (!subscriberNo || !month || totalAmount == null) {
      failed++;
      continue;
    }

    try {
      await addBill(subscriberNo, month, totalAmount);
      success++;
    } catch (err) {
      console.error("Batch insert error", err);
      failed++;
    }
  }

  return { success, failed };
}

module.exports = {
  getBillSummary,
  getBillDetails,
  getUnpaidBills,
  payBill,
  addBill,
  addBillsBatch,
};
