const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

function safeJsonParse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in LLM response");
  return JSON.parse(match[0]);
}

async function extractParams(message) {
  if (!genAI) throw new Error("GEMINI_API_KEY tanımlı değil");

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
You are a parameter extractor for a billing assistant.

Return ONLY valid JSON, no text.

Extract:
- subscriberNo (string)
- month (YYYY-MM)  // ex: "2024-10"
- amount (number or null) // only if user wants to pay

If missing, set null.

Schema:
{
  "subscriberNo": "string|null",
  "month": "YYYY-MM|null",
  "amount": number|null
}

User message: ${JSON.stringify(message)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log("[LLM RAW RESPONSE]", text);

  const parsed = safeJsonParse(text);

  const subscriberNo = parsed.subscriberNo ?? parsed.parameters?.subscriberNo ?? null;
  const month = parsed.month ?? parsed.parameters?.month ?? null;
  const amount =
    parsed.amount ?? parsed.parameters?.amount ?? null;

  return {
    subscriberNo: subscriberNo != null ? String(subscriberNo) : null,
    month: month != null ? String(month) : null,
    amount: amount == null ? null : Number(amount),
  };
}

module.exports = { extractParams };
