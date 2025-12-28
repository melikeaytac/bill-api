export async function sendMessage(message, mode) {
  const res = await fetch("https://bill-l1ys0gz5g-melike-aytacs-projects.vercel.app/chat", {
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
