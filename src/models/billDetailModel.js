const db = require("../db");

async function getBillDetails(subscriberId, month, page, size) {
  const offset = (page - 1) * size;

  const result = await db.query(
    `
    SELECT 
      id,
      description,
      amount
    FROM bill_details
    WHERE subscriber_id = $1
      AND month = $2
    ORDER BY id
    LIMIT $3 OFFSET $4
    `,
    [subscriberId, month, size, offset]
  );

  return result.rows;
}

async function getBillDetailsCount(subscriberId, month) {
  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM bill_details
    WHERE subscriber_id = $1
      AND month = $2
    `,
    [subscriberId, month]
  );

  return Number(result.rows[0].count);
}

module.exports = {
  getBillDetails,
  getBillDetailsCount,
};
