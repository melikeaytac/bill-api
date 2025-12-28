const db = require("../db");

async function getSubscriberId(subscriberNo) {
  const result = await db.query(
    `SELECT id FROM subscribers WHERE subscriber_no = $1`,
    [subscriberNo]
  );

  return result.rows[0] ? result.rows[0].id : null;
}

module.exports = {
  getSubscriberId,
};
