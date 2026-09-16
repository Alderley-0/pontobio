import { getTelegramUpdates, sendTelegramMessage } from "./telegram.js";

function formatMovieList(movies) {
  if (movies.length === 0) {
    return "Nenhum filme em pré-venda no momento.";
  }

  const lines = movies.map((movie) => `• ${movie.title}\n  ${movie.url}`);
  return `🎬 <b>Em pré-venda agora</b>\n${lines.join("\n")}`;
}

function formatStatus(status) {
  if (!status.lastCheckAt) {
    return "Ainda não completou a primeira checagem.";
  }

  const linhas = [`Última checagem: ${status.lastCheckAt}`];
  linhas.push(status.lastError ? `Erro: ${status.lastError}` : "Sem erros.");
  return linhas.join("\n");
}

// Fica em long polling esperando comando do usuário (/filmes, /status) e
// responde na hora, no mesmo chat de onde veio (privado ou grupo). Roda em
// paralelo com o loop de checagem de pré-venda.
export async function pollTelegramCommands(token, getState) {
  let offset = 0;

  while (true) {
    let updates;
    try {
      updates = await getTelegramUpdates(token, offset);
    } catch (err) {
      console.error(`Erro ao buscar comandos do Telegram: ${err.message}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    for (const update of updates) {
      offset = update.update_id + 1;

      const message = update.message;
      if (!message?.text) continue;

      const chatId = message.chat.id;
      const text = message.text.trim();
      const { lastMovies, lastCheckAt, lastError } = getState();

      if (text.startsWith("/filmes")) {
        await sendTelegramMessage(token, chatId, formatMovieList(lastMovies));
      } else if (text.startsWith("/status")) {
        await sendTelegramMessage(token, chatId, formatStatus({ lastCheckAt, lastError }));
      } else if (text.startsWith("/start")) {
        await sendTelegramMessage(
          token,
          chatId,
          "Oi! Uso /filmes pra ver a pré-venda atual e /status pra ver a última checagem."
        );
      }
    }
  }
}
