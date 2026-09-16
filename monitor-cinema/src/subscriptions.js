import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { sendTelegramMessage } from "./telegram.js";

const FILE = path.join(process.cwd(), "data", "subscriptions.json");

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export async function loadSubscriptions() {
  try {
    const raw = await readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveSubscriptions(subs) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(subs), "utf-8");
}

export function matchesQuery(title, query) {
  return normalize(title).includes(normalize(query));
}

// Pra cada filme atualmente em pré-venda, tenta notificar quem pediu (uma
// vez só, no privado). Se a pessoa nunca deu /start no bot, o envio falha
// silenciosamente e a assinatura continua pendente pro próximo ciclo — sem
// ficar reclamando de novo no grupo a cada tentativa.
export async function processSubscriptions(token, movies, subs) {
  const remaining = [];
  let changed = false;

  for (const sub of subs) {
    const movie = movies.find((m) => matchesQuery(m.title, sub.query));

    if (!movie) {
      remaining.push(sub);
      continue;
    }

    try {
      await sendTelegramMessage(
        token,
        sub.userId,
        `🎬 <b>Pré-venda aberta!</b>\n${movie.title}\n${movie.url}\n\n(você pediu pra saber sobre esse filme)`
      );
      changed = true;
    } catch {
      remaining.push(sub);
    }
  }

  if (changed) {
    await saveSubscriptions(remaining);
  }

  return remaining;
}
