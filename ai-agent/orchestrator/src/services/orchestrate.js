const { parseIntentStub } = require("./parseIntentStub");
const { callMidterm } = require("./callMidterm");

async function orchestrate(req, res) {
  const { userId = "demo-user", text } = req.body || {};
  if (!text) return res.status(400).json({ message: "text is required" });

  const parsed = await parseIntentStub(text);

  const apiResult = await callMidterm(parsed);

  return res.json({
    userId,
    parsed,
    apiResult
  });
}

module.exports = { orchestrate };
