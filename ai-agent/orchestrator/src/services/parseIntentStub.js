const { INTENTS } = require("../../shared/constants");

async function parseIntentStub(text) {
  const t = (text || "").toLowerCase();

  if (t.includes("detailed") || t.includes("detay")) {
    return { intent: INTENTS.QUERY_BILL_DETAILED, params: {} , confidence: 0.4 };
  }
  if (t.includes("pay") || t.includes("öde")) {
    return { intent: INTENTS.PAY_BILL, params: {} , confidence: 0.4 };
  }
  if (t.includes("bill") || t.includes("fatura") || t.includes("borç")) {
    return { intent: INTENTS.QUERY_BILL, params: {} , confidence: 0.4 };
  }

  return { intent: INTENTS.UNKNOWN, params: {}, confidence: 0.1 };
}

module.exports = { parseIntentStub };
