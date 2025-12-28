const express = require("express");
const router = express.Router();
const { createBillApiClient } = require("../clients/billApiClient");

const billApi = createBillApiClient();


router.get("/mobile/bill", async (req, res) => {
  try {
    const r = await billApi.get("/mobile/bill", { params: req.query });
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

router.get("/mobile/bill/detailed", async (req, res) => {
  try {
    const r = await billApi.get("/mobile/bill/detailed", { params: req.query });
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

router.get("/bank/bill", async (req, res) => {
  try {
    const r = await billApi.get("/bank/bill", { params: req.query });
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

router.post("/web/pay", async (req, res) => {
  try {
    const r = await billApi.post("/web/pay", req.body);
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

router.post("/admin/bill", async (req, res) => {
  try {
    const r = await billApi.post("/admin/bill", req.body);
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

router.post("/admin/bill/batch", async (req, res) => {
  try {
    const r = await billApi.post("/admin/bill/batch", req.body);
    return res.status(r.status).json(r.data);
  } catch (e) {
    return res.status(e.response?.status || 500).json({ error: e.message, details: e.response?.data });
  }
});

module.exports = router;
