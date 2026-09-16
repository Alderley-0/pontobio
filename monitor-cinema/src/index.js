import http from "node:http";
import { fetchPreSaleMovies } from "./source.js";
import { sendTelegramMessage, sendTelegramPhoto } from "./telegram.js";
import { loadSeenIds, saveSeenIds } from "./state.js";
import { pollTelegramCommands } from "./commands.js";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const INTERVAL_MS = Number(process.env.POLL_INTERVAL_SECONDS ?? 20) * 1000;
const PORT = process.env.PORT ?? 3000;

if (!TOKEN || !CHAT_ID) {
  throw new Error(
    "Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID nas variáveis de ambiente."
  );
}

let lastCheckAt = null;
let lastError = null;
let lastMovies = [];

async function checkOnce(seenIds) {
  const movies = await fetchPreSaleMovies();
  lastMovies = movies;
  const newMovies = movies.filter((movie) => !seenIds.has(movie.id));

  for (const movie of newMovies) {
    const caption = `🎬 <b>Pré-venda aberta!</b>\n${movie.title}\n${movie.url}`;
    if (movie.poster) {
      await sendTelegramPhoto(TOKEN, CHAT_ID, movie.poster, caption);
    } else {
      await sendTelegramMessage(TOKEN, CHAT_ID, caption);
    }
    seenIds.add(movie.id);
  }

  if (newMovies.length > 0) {
    await saveSeenIds(seenIds);
  }

  return newMovies.length;
}

async function loop() {
  const seenIds = await loadSeenIds();

  while (true) {
    try {
      const count = await checkOnce(seenIds);
      lastCheckAt = new Date().toISOString();
      lastError = null;
      if (count > 0) {
        console.log(`${lastCheckAt} — ${count} filme(s) novo(s) em pré-venda`);
      }
    } catch (err) {
      lastError = err.message;
      console.error(`Erro ao checar pré-venda: ${err.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}

// Servidor HTTP mínimo: só existe pra plataformas como Render/Railway
// considerarem o serviço "no ar" e pra dar um jeito de checar se está vivo.
http
  .createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", lastCheckAt, lastError }));
  })
  .listen(PORT, () => {
    console.log(`Monitor de cinema no ar — checando a cada ${INTERVAL_MS / 1000}s`);
  });

loop();
pollTelegramCommands(TOKEN, CHAT_ID, () => ({ lastMovies, lastCheckAt, lastError }));
