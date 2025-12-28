const axios = require("axios");

function createGatewayClient() {
  const baseURL = process.env.GATEWAY_BASE_URL || "https://bill-api-three.vercel.app";
  return axios.create({ baseURL, timeout: 15000 });
}

module.exports = { createGatewayClient };
