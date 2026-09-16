import { getTelegramUpdates, sendTelegramMessage } from "./telegram.js";
import { loadSubscriptions, saveSubscriptions, matchesQuery } from "./subscriptions.js";

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

async function handleAvisar(token, chatId, userId, query, lastMovies, subs) {
  if (!query) {
    await sendTelegramMessage(
      token,
      chatId,
      "Usa assim: /avisar nome do filme (ex: /avisar Vingadores)"
    );
    return;
  }

  const match = lastMovies.find((m) => matchesQuery(m.title, query));

  if (match) {
    try {
      await sendTelegramMessage(
        token,
        userId,
        `🎬 <b>Pré-venda aberta!</b>\n${match.title}\n${match.url}`
      );
      await sendTelegramMessage(
        token,
        chatId,
        `"${match.title}" já está em pré-venda — te avisei no privado.`
      );
    } catch {
      await sendTelegramMessage(
        token,
        chatId,
        `"${match.title}" já está em pré-venda, mas não consegui te mandar no privado. ` +
          `Dá um /start no bot no privado primeiro e manda /avisar ${query} de novo.`
      );
    }
    return;
  }

  subs.push({ query, userId, originChatId: chatId });
  await saveSubscriptions(subs);
  await sendTelegramMessage(
    token,
    chatId,
    `Combinado! Vou te avisar no privado quando "${query}" entrar em pré-venda. ` +
      `Se você nunca deu /start no bot no privado, manda uma mensagem lá antes — ` +
      `sem isso eu não consigo te notificar (é uma regra do Telegram, não meu bug).`
  );
}

async function handleParar(token, chatId, userId, query, subs) {
  if (!query) {
    await sendTelegramMessage(token, chatId, "Usa assim: /parar nome do filme");
    return { subs, changed: false };
  }

  const before = subs.length;
  const remaining = subs.filter(
    (s) => !(s.userId === userId && matchesQuery(s.query, query))
  );

  if (remaining.length === before) {
    await sendTelegramMessage(token, chatId, `Não achei nenhuma assinatura sua com "${query}".`);
    return { subs, changed: false };
  }

  await saveSubscriptions(remaining);
  await sendTelegramMessage(token, chatId, `Removido. Você não vai mais ser avisado sobre "${query}".`);
  return { subs: remaining, changed: true };
}

async function handleMinhasAssinaturas(token, chatId, userId, subs) {
  const minhas = subs.filter((s) => s.userId === userId);

  if (minhas.length === 0) {
    await sendTelegramMessage(token, chatId, "Você não tem nenhuma assinatura pendente.");
    return;
  }

  const lines = minhas.map((s) => `• ${s.query}`);
  await sendTelegramMessage(token, chatId, `🔔 <b>Suas assinaturas pendentes</b>\n${lines.join("\n")}`);
}

// Fica em long polling esperando comando do usuário e responde na hora, no
// mesmo chat de onde veio (privado ou grupo). Roda em paralelo com o loop de
// checagem de pré-venda.
export async function pollTelegramCommands(token, getState) {
  let offset = 0;
  let subs = await loadSubscriptions();

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
      const userId = message.from.id;
      const text = message.text.trim();
      const { lastMovies, lastCheckAt, lastError } = getState();

      if (text.startsWith("/filmes")) {
        await sendTelegramMessage(token, chatId, formatMovieList(lastMovies));
      } else if (text.startsWith("/status")) {
        await sendTelegramMessage(token, chatId, formatStatus({ lastCheckAt, lastError }));
      } else if (text.startsWith("/avisar")) {
        const query = text.slice("/avisar".length).trim();
        await handleAvisar(token, chatId, userId, query, lastMovies, subs);
      } else if (text.startsWith("/parar")) {
        const query = text.slice("/parar".length).trim();
        const result = await handleParar(token, chatId, userId, query, subs);
        subs = result.subs;
      } else if (text.startsWith("/minhasassinaturas")) {
        await handleMinhasAssinaturas(token, chatId, userId, subs);
      } else if (text.startsWith("/start")) {
        await sendTelegramMessage(
          token,
          chatId,
          "Oi! Comandos disponíveis:\n" +
            "/filmes — pré-venda atual\n" +
            "/status — última checagem\n" +
            "/avisar <filme> — te aviso no privado quando esse filme entrar em pré-venda\n" +
            "/parar <filme> — cancela um aviso pendente\n" +
            "/minhasassinaturas — lista seus avisos pendentes"
        );
      }
    }
  }
}
