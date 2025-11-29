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
  const result = await db.query(
    `
    UPDATE bills b
    SET paid_amount = LEAST(total_amount, paid_amount + $3)
    WHERE b.subscriber_id = (
      SELECT id FROM subscribers WHERE subscriber_no = $1
    )
      AND b.month = $2
    RETURNING 
      total_amount,
      paid_amount
    `,
    [subscriberNo, month, amount]
  );

  if (result.rowCount === 0) {
    return { status: "NOT_FOUND" };
  }

  const row = result.rows[0];

  const totalNum = Number(row.total_amount);
  const paidNum = Number(row.paid_amount);
  const remainingNum = totalNum - paidNum;

  return {
    status: "OK",
    isPaid: remainingNum === 0,
    total: totalNum.toFixed(2),
    paidAmount: paidNum.toFixed(2),
    remaining: remainingNum.toFixed(2),
  };
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

/**
 * Tek fatura ekler.
 * paidAmount verilmezse 0 olarak kabul edilir.
 */
async function addBill(subscriberNo, month, totalAmount, paidAmount = 0) {
  const subscriberId = await getOrCreateSubscriber(subscriberNo);

  const inserted = await db.query(
    `
    INSERT INTO bills (subscriber_id, month, total_amount, paid_amount)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [subscriberId, month, totalAmount, paidAmount]
  );

  return inserted.rows[0].id;
}

/**
 * JSON veya CSV'den gelen items dizisini toplu ekler.
 * Her item: { subscriberNo, month, totalAmount, paidAmount? }
 */
async function addBillsBatch(items) {
  let success = 0;
  let failed = 0;

  for (const item of items) {
    const { subscriberNo, month, totalAmount, paidAmount } = item || {};

    if (!subscriberNo || !month || totalAmount == null) {
      failed++;
      continue;
    }

    const initialPaid =
      paidAmount !== undefined && paidAmount !== null
        ? Number(paidAmount)
        : 0;

    try {
      await addBill(subscriberNo, month, totalAmount, initialPaid);
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
