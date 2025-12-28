function errorHandler(err, req, res, next) {
  const status = err.response?.status || 500;
  const payload = err.response?.data || { message: err.message || "Internal Server Error" };
  res.status(status).json({ success: false, error: payload });
}

module.exports = { errorHandler };
