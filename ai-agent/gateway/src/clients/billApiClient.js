const axios = require("axios");

let cachedToken = null;
let cachedTokenExpiry = 0;
let inflightLogin = null;

async function ensureBearerToken(baseURL, username, password) {
  if (!username || !password) return null;

  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry - 5000) return cachedToken;

  if (inflightLogin) return inflightLogin;

  inflightLogin = axios
    .post(`${baseURL}/auth/login`, { username, password }, { timeout: 10000 })
    .then((resp) => {
      const token = resp.data?.accessToken;
      const expiresInMs = (resp.data?.expiresIn ?? 3600) * 1000;
      cachedToken = token;
      cachedTokenExpiry = Date.now() + expiresInMs;
      return token;
    })
    .finally(() => {
      inflightLogin = null;
    });

  return inflightLogin;
}

function createBillApiClient() {
  const baseURL = process.env.BILL_API_BASE_URL;
  const username = process.env.BILL_API_USERNAME;
  const password = process.env.BILL_API_PASSWORD;

  const client = axios.create({
    baseURL,
    timeout: 15000
  });

  client.interceptors.request.use(async (config) => {
    const token = await ensureBearerToken(baseURL, username, password);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

module.exports = { createBillApiClient };
