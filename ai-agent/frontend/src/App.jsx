import React, { useMemo, useState, useEffect, useRef } from "react";
import { sendMessage } from "./services/chatApi";
import { addMessage, subscribeMessages,fetchSystemMessages  } from "./services/firestoreChat";
import "./App.css";

const MODES = [
  { key: "query", label: "Query bill" },
  { key: "detailed", label: "Detailed bill" },
  { key: "pay", label: "Pay bill" },
];

export default function App() {
  const [mode, setMode] = useState("query");
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState({
    query: [],
    detailed: [],
    pay: [],
  });
  const [systemMessages, setSystemMessages] = useState([]);
  const messages = useMemo(() => threads?.[mode] || [], [threads, mode]);
  const listRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeMessages((msgs) => {
      const grouped = { query: [], detailed: [], pay: [] };
      const system = msgs.filter((m) => m.mode === "system");
      msgs.forEach((m) => {
        if (grouped[m.mode]) grouped[m.mode].push(m);
      });
      setSystemMessages(system);
      setThreads(grouped);
    });
    return () => unsubscribe();
  }, []);

useEffect(() => {
  let added = false;

  const addWelcomeIfNeeded = async () => {
    if (added) return;
    added = true;

    const res = await fetchSystemMessages();
    if (!res || res.length === 0) {
      const welcomeText =
        "👋 Hello! How can I assist you today?\nChoose one of the actions below to get started:";
      await addMessage("assistant", welcomeText, "system");
    }
  };

  addWelcomeIfNeeded();
}, []);



  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, mode]);

  function pushMessage(threadKey, msg) {
    setThreads((prev) => ({
      ...prev,
      [threadKey]: [...(prev[threadKey] || []), msg],
    }));
  }

  async function onSend() {
    const text = input.trim();
    if (!text) return;

    pushMessage(mode, { role: "user", text });
    setInput("");
    await addMessage("user", text, mode);

    try {
      const data = await sendMessage(text, mode);
      const assistantText =
        data?.assistantText ||
        data?.data?.assistantText ||
        data?.message ||
        "Yanıt alınamadı.";

      pushMessage(mode, { role: "assistant", text: assistantText });
      await addMessage("assistant", assistantText, mode);
    } catch (e) {
      const msg =
        e?.response?.data?.details?.assistantText ||
        e?.response?.data?.message ||
        e?.message ||
        "İşlem sırasında bir hata oluştu.";
      pushMessage(mode, { role: "assistant", text: msg });
      await addMessage("assistant", msg, mode);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="header">
          <h1>Billing Agent</h1>
          <div className="tabs">
            {MODES.map((m) => (
              <button
                key={m.key}
                className={`tab ${mode === m.key ? "active" : ""}`}
                onClick={() => setMode(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chat" ref={listRef}>
{systemMessages.map((m) => (
  <div key={m.id} className="row left">
    <div className="bubble system">{m.text}</div>
  </div>
))}

{systemMessages.length > 0 && (
  <div className="welcome-buttons">
    <button onClick={() => setMode("query")}>🔍 Query Bill</button>
    <button onClick={() => setMode("detailed")}>📄 Query Bill Detailed</button>
    <button onClick={() => setMode("pay")}>💳 Pay Bill</button>
  </div>
)}


          {messages.map((m) => (
            <div
              key={m.id || Math.random()}
              className={`row ${m.role === "user" ? "right" : "left"}`}
            >
              <div className={`bubble ${m.role}`}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="composer">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "query"
                ? "Örn. 123 aboneliğim için 2024-10 faturamı göster"
                : mode === "detailed"
                ? "Örn. 123 aboneliğim için 2024-10 detaylı faturamı göster"
                : "Örn. 123 aboneliğim için 2024-10 faturamdan 50 TL öde"
            }
            onKeyDown={(e) => e.key === "Enter" && onSend()}
          />
          <button onClick={onSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
