const API_BASE = "https://api.telegram.org";

export async function sendTelegramMessage(token, chatId, text) {
  const url = `${API_BASE}/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API respondeu ${res.status}: ${body}`);
  }
}

export async function sendTelegramPhoto(token, chatId, photoUrl, caption) {
  const url = `${API_BASE}/bot${token}/sendPhoto`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API respondeu ${res.status}: ${body}`);
  }
}
