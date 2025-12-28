const axios = require("axios");
const { INTENTS } = require("../../shared/constants");

const base = process.env.MIDTERM_BASE_URL;

async function callMidterm(parsed) {
  switch (parsed.intent) {
    case INTENTS.QUERY_BILL:
      return (await axios.get(`${base}/api/v1/mobile/bill`, { params: parsed.params })).data;

    case INTENTS.QUERY_BILL_DETAILED:
      return (await axios.get(`${base}/api/v1/mobile/bill/detailed`, { params: parsed.params })).data;

    case INTENTS.PAY_BILL:
      return (await axios.post(`${base}/api/v1/web/pay`, parsed.params)).data;

    default:
      return { message: "Unknown intent. Try: query bill / detailed bill / pay bill." };
  }
}

module.exports = { callMidterm };
