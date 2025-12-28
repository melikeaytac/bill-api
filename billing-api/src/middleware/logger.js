const db = require("../db");

async function insertLog(data) {
  try {
    await db.query(
      `
      INSERT INTO request_logs 
      (method, path, request_timestamp, source_ip, headers, request_size,
       auth_succeeded, status_code, response_latency_ms, response_size)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      [
        data.method,
        data.path,
        data.timestamp,
        data.sourceIp,
        data.headers,
        data.requestSize,
        data.authSucceeded,
        data.statusCode,
        data.latency,
        data.responseSize,
      ]
    );
  } catch (err) {
    console.error("LOG INSERT ERROR:", err.message);
  }
}

module.exports = (req, res, next) => {
  const startTime = Date.now();

  const logData = {
    method: req.method,
    path: req.originalUrl || req.url,
    timestamp: new Date(),
    sourceIp: req.ip,
    headers: req.headers,
    requestSize: Number(req.headers["content-length"] || 0),
    authSucceeded: false,
    statusCode: null,
    latency: null,
    responseSize: null,
  };

  res.on("finish", () => {
    logData.statusCode = res.statusCode;
    logData.latency = Date.now() - startTime;

    const resLen = res.getHeader("content-length");
    logData.responseSize = resLen ? Number(resLen) : null;

    logData.authSucceeded = !!req.user;

    insertLog(logData);
  });

  next();
};
