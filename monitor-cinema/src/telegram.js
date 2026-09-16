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

// Long polling: fica esperando até 25s por mensagens novas (mais rápido pra
// responder comando e mais leve que ficar checando a cada poucos segundos).
export async function getTelegramUpdates(token, offset) {
  const url = `${API_BASE}/bot${token}/getUpdates?timeout=25&offset=${offset}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API respondeu ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.result;
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
