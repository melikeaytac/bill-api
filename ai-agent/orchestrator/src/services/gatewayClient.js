const axios = require("axios");

function createGatewayClient() {
  const baseURL = process.env.GATEWAY_BASE_URL || "https://bill-l1ys0gz5g-melike-aytacs-projects.vercel.app/";
  return axios.create({ baseURL, timeout: 15000 });
}

module.exports = { createGatewayClient };
