export async function sendMessage(message, mode) {
  const res = await fetch("http://localhost:5101/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, mode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.assistantText || data?.error || "request_failed");
  }
  return data;
}
