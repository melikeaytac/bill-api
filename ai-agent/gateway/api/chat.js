const axios = require("axios");

module.exports = async (req, res) => {


    const origin = req.headers.origin;

    const allowOrigin = process.env.ALLOW_ORIGIN || origin || "*";

    res.setHeader("Access-Control-Allow-Origin", allowOrigin);

    res.setHeader("Vary", "Origin");

    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("X-Handler", "serverless");

    if (req.method === "OPTIONS") {

        res.status(200).end();

        return;

    }

    try {

        const { message, mode } = req.body || {};

        if (!message) {

            return res.status(400).json({ success: false, message: "message is required" });

        }


        const base = "https://bill-api-orch-fnij27o30-melike-aytacs-projects.vercel.app";

        console.log("İstek atılan adres:", `${base}/chat`); 

        const result = await axios.post(`${base}/chat`, { message, mode });

        res.status(200).json(result.data);

    } catch (err) {

        console.error("Gateway Hatası:", err.message);

        const status = err.response?.status || err.status || 500;

        res.status(status).json({

            error: "gateway_chat_failed",

            details: {

                message: err?.message || "unknown_error",

                targetUrl: "https://bill-api-orch-fnij27o30-melike-aytacs-projects.vercel.app/chat"

            },

            assistantText: "İşlem sırasında bir hata oluştu.",

        });

    }

};
