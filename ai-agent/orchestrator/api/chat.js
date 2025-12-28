const { extractParams } = require("../src/llm/intentParser");
const { createGatewayClient } = require("../src/services/gatewayClient");

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

module.exports = async (req, res) => {
  // CORS for browser requests
  const origin = req.headers.origin;
  const allowOrigin = process.env.ALLOW_ORIGIN || origin || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const message = req.body?.message || "";
  const mode = normalizeMode(req.body?.mode);

  console.log("[orchestrator/chat] incoming", { message, mode });

  let p;
  try {
    p = await extractParams(message);
    console.log("[orchestrator/chat] extracted", p);
  } catch (err) {
    console.error("[orchestrator/chat] parse error:", err);
    res.status(500).json({
      error: "intent_parse_failed",
      details: err?.message,
      assistantText: "İstek anlaşılmadı (parametre çıkarılamadı).",
    });
    return;
  }

  const forcedIntent = mode || "query_bill";

  if (!p.subscriberNo || !p.month) {
    res.json({
      intent: forcedIntent,
      parameters: p,
      assistantText:
        "Abone numarası ve ay bilgisi gerekli. Örn: 123 aboneliğim için 2024-10 faturamı göster",
    });
    return;
  }

  const gw = createGatewayClient();

  try {
    if (forcedIntent === "query_bill") {
      const r = await gw.get("/gateway/mobile/bill", {
        params: { subscriberNo: p.subscriberNo, month: p.month },
      });
      const total = fmtMoney(r.data?.total);
      const paid = r.data?.paidStatus ? "Ödendi" : "Ödenmedi";
      res.json({
        intent: forcedIntent,
        parameters: p,
        data: r.data,
        assistantText: `${p.subscriberNo} aboneliğiniz için ${monthNameTR(p.month)} faturanız toplam ${total} TL. Durum: ${paid}.`,
      });
      return;
    }

    if (forcedIntent === "query_bill_detailed") {
      try {
        const r = await gw.get("/gateway/mobile/bill/detailed", {
          params: { subscriberNo: p.subscriberNo, month: p.month, page: 1, size: 10 },
        });
        const total = fmtMoney(r.data?.total);
        const details = Array.isArray(r.data?.details) ? r.data.details : [];
        const lines = details.map((d) => `- ${d.description}: ${fmtMoney(d.amount)} TL`);
        const itemsText = lines.length ? `\nKalemler:\n${lines.join("\n")}` : "\nDetay kalemi bulunamadı.";
        res.json({
          intent: forcedIntent,
          parameters: p,
          data: r.data,
          assistantText: `${monthNameTR(p.month)} faturanız toplam ${total} TL.${itemsText}`,
        });
        return;
      } catch (e) {
        if (e.response?.status === 404) {
          const s = await gw.get("/gateway/mobile/bill", {
            params: { subscriberNo: p.subscriberNo, month: p.month },
          });
          const total = fmtMoney(s.data?.total);
          res.json({
            intent: forcedIntent,
            parameters: p,
            data: { summary: s.data },
            assistantText: `${monthNameTR(p.month)} faturanız var ancak detaylı kullanım kalemi bulunmamaktadır. Toplam: ${total} TL.`,
          });
          return;
        }
        throw e;
      }
    }

    if (forcedIntent === "pay_bill") {
      if (p.amount == null || Number.isNaN(p.amount) || p.amount <= 0) {
        res.json({
          intent: forcedIntent,
          parameters: p,
          assistantText: "Ödeme tutarı gerekli. Örn: 123 aboneliğim için 2024-10 faturamdan 50 TL öde",
        });
        return;
      }

      const r = await gw.post("/gateway/web/pay", {
        subscriberNo: p.subscriberNo,
        month: p.month,
        amount: p.amount,
      });

      const remaining = fmtMoney(r.data?.remaining);
      const status = r.data?.isPaid ? "Ödendi" : "Kısmi ödeme";
      res.json({
        intent: forcedIntent,
        parameters: p,
        data: r.data,
        assistantText: `Ödeme alındı. Kalan borç: ${remaining} TL. Durum: ${status}.`,
      });
      return;
    }

    res.json({ intent: forcedIntent, parameters: p, assistantText: "Bilinmeyen işlem modu." });
  } catch (e) {
    const status = e.response?.status || 500;
    const msg = e.response?.data?.message || e.response?.data?.error || e.message;

    res.status(status).json({
      intent: forcedIntent,
      parameters: p,
      error: msg,
      details: e.response?.data,
      assistantText: status === 404 ? "Fatura bulunamadı." : "İşlem sırasında bir hata oluştu.",
    });
  }
};
