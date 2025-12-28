require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { extractParams } = require("./llm/intentParser");
const { createGatewayClient } = require("./services/gatewayClient");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "orchestrator" }));

const gw = createGatewayClient();

function normalizeMode(mode) {
  const m = String(mode || "").toLowerCase();
  if (m === "query" || m === "query_bill") return "query_bill";
  if (m === "detailed" || m === "query_bill_detailed") return "query_bill_detailed";
  if (m === "pay" || m === "pay_bill") return "pay_bill";
  return null;
}

function monthNameTR(yyyyMm) {
  return yyyyMm;
}

function fmtMoney(x) {
  if (x == null) return null;
  const n = Number(x);
  if (Number.isNaN(n)) return String(x);
  return n.toFixed(2);
}

app.post("/chat", async (req, res) => {
  const message = req.body?.message || "";
  const mode = normalizeMode(req.body?.mode);

  console.log("[chat] incoming message:", message, "mode:", mode);

  let p;
  try {
    p = await extractParams(message);
    console.log("[chat] extracted params:", p);
  } catch (err) {
    console.error("[chat] extractParams error:", err);
    return res.status(500).json({
      error: "intent_parse_failed",
      details: err?.message,
      assistantText: "İstek anlaşılmadı (parametre çıkarılamadı).",
    });
  }

  const forcedIntent = mode || "query_bill";

  if (!p.subscriberNo || !p.month) {
    return res.json({
      intent: forcedIntent,
      parameters: p,
      assistantText: "Abone numarası ve ay bilgisi gerekli. Örn: 123 aboneliğim için 2024-10 faturamı göster",
    });
  }

  try {
    if (forcedIntent === "query_bill") {
      const r = await gw.get("/gateway/mobile/bill", { params: { subscriberNo: p.subscriberNo, month: p.month } });
      const total = fmtMoney(r.data?.total);
      const paid = r.data?.paidStatus ? "Ödendi" : "Ödenmedi";
      return res.json({
        intent: forcedIntent,
        parameters: p,
        data: r.data,
        assistantText: `${p.subscriberNo} aboneliğiniz için ${monthNameTR(p.month)} faturanız toplam ${total} TL. Durum: ${paid}.`,
      });
    }

    if (forcedIntent === "query_bill_detailed") {
      try {
        const r = await gw.get("/gateway/mobile/bill/detailed", { params: { subscriberNo: p.subscriberNo, month: p.month, page: 1, size: 10 } });
        const total = fmtMoney(r.data?.total);
        const details = Array.isArray(r.data?.details) ? r.data.details : [];
        const lines = details.map((d) => `- ${d.description}: ${fmtMoney(d.amount)} TL`);
        const itemsText = lines.length ? `\nKalemler:\n${lines.join("\n")}` : "\nDetay kalemi bulunamadı.";
        return res.json({
          intent: forcedIntent,
          parameters: p,
          data: r.data,
          assistantText: `${monthNameTR(p.month)} faturanız toplam ${total} TL.${itemsText}`,
        });
      } catch (e) {
        if (e.response?.status === 404) {
          const s = await gw.get("/gateway/mobile/bill", { params: { subscriberNo: p.subscriberNo, month: p.month } });
          const total = fmtMoney(s.data?.total);
          return res.json({
            intent: forcedIntent,
            parameters: p,
            data: { summary: s.data },
            assistantText: `${monthNameTR(p.month)} faturanız var ancak detaylı kullanım kalemi bulunmamaktadır. Toplam: ${total} TL.`,
          });
        }
        throw e;
      }
    }

    if (forcedIntent === "pay_bill") {
      if (p.amount == null || Number.isNaN(p.amount) || p.amount <= 0) {
        return res.json({
          intent: forcedIntent,
          parameters: p,
          assistantText: "Ödeme tutarı gerekli. Örn: 123 aboneliğim için 2024-10 faturamdan 50 TL öde",
        });
      }

      const r = await gw.post("/gateway/web/pay", {
        subscriberNo: p.subscriberNo,
        month: p.month,
        amount: p.amount,
      });

      const remaining = fmtMoney(r.data?.remaining);
      const status = r.data?.isPaid ? "Ödendi" : "Kısmi ödeme";
      return res.json({
        intent: forcedIntent,
        parameters: p,
        data: r.data,
        assistantText: `Ödeme alındı. Kalan borç: ${remaining} TL. Durum: ${status}.`,
      });
    }

    return res.json({
      intent: forcedIntent,
      parameters: p,
      assistantText: "Bilinmeyen işlem modu.",
    });
  } catch (e) {
    const status = e.response?.status || 500;
    const msg = e.response?.data?.message || e.response?.data?.error || e.message;

    return res.status(status).json({
      intent: forcedIntent,
      parameters: p,
      error: msg,
      details: e.response?.data,
      assistantText: status === 404 ? "Fatura bulunamadı." : "İşlem sırasında bir hata oluştu.",
    });
  }
});

const port = process.env.PORT ;
app.listen(port, () => console.log(`[orchestrator] listening on :${port}`));
