import { getTelegramUpdates, sendTelegramMessage } from "./telegram.js";
import { loadSubscriptions, saveSubscriptions, matchesQuery } from "./subscriptions.js";

const HELP_TEXT =
  "🎬 <b>Monitor de pré-venda de cinema</b>\n" +
  "Fico checando o Ingresso.com o tempo todo e aviso automaticamente aqui " +
  "assim que um filme novo entra em pré-venda. Além disso, respondo estes " +
  "comandos:\n\n" +
  "<b>/filmes</b>\n" +
  "Lista todos os filmes que estão em pré-venda agora, com link de cada um.\n\n" +
  "<b>/status</b>\n" +
  "Mostra quando foi a última vez que eu checei o site e se deu algum erro " +
  "na checagem.\n\n" +
  "<b>/avisar &lt;nome do filme&gt;</b>\n" +
  "Pede pra eu te avisar, no seu privado, quando aquele filme específico " +
  "entrar em pré-venda (ex: /avisar Vingadores). Se ele já estiver em " +
  "pré-venda, eu já te aviso na hora. Pra eu conseguir te mandar mensagem " +
  "privada, você precisa ter dado /start em mim no privado antes (regra do " +
  "Telegram, não depende de mim) — se não tiver feito isso ainda, eu aviso " +
  "e fico tentando de novo a cada checagem até você dar /start.\n\n" +
  "<b>/parar &lt;nome do filme&gt;</b>\n" +
  "Cancela um aviso que você pediu com /avisar.\n\n" +
  "<b>/minhasassinaturas</b>\n" +
  "Lista os avisos que você pediu com /avisar e que ainda estão pendentes " +
  "(o filme ainda não entrou em pré-venda).\n\n" +
  "<b>/ajuda</b>\n" +
  "Mostra esta mensagem de novo.\n\n" +
  "Todos esses comandos funcionam tanto no privado quanto em qualquer grupo " +
  "em que eu estiver.";

// Telegram recusa mensagem com mais de 4096 caracteres — com o catálogo
// completo (pode passar de 100 filmes), uma lista só não cabe. Divide em
// várias mensagens.
const MOVIES_PER_MESSAGE = 25;

function formatMovieListChunks(movies) {
  if (movies.length === 0) {
    return ["Nenhum filme em pré-venda no momento."];
  }

  const chunks = [];
  for (let i = 0; i < movies.length; i += MOVIES_PER_MESSAGE) {
    const slice = movies.slice(i, i + MOVIES_PER_MESSAGE);
    const lines = slice.map((movie) => `• ${movie.title}\n  ${movie.url}`);
    const titulo =
      movies.length > MOVIES_PER_MESSAGE
        ? `🎬 <b>Em pré-venda agora</b> (${i + 1}–${i + slice.length} de ${movies.length})`
        : "🎬 <b>Em pré-venda agora</b>";
    chunks.push(`${titulo}\n${lines.join("\n")}`);
  }
  return chunks;
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

      // Um comando com problema (ex: resposta grande demais pro Telegram)
      // não pode derrubar o processo inteiro — só loga e segue pro próximo.
      try {
        if (text.startsWith("/filmes")) {
          for (const chunk of formatMovieListChunks(lastMovies)) {
            await sendTelegramMessage(token, chatId, chunk);
          }
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
        } else if (text.startsWith("/ajuda") || text.startsWith("/help")) {
          await sendTelegramMessage(token, chatId, HELP_TEXT);
        } else if (text.startsWith("/start")) {
          await sendTelegramMessage(token, chatId, HELP_TEXT);
        }
      } catch (err) {
        console.error(`Erro ao processar comando "${text}": ${err.message}`);
      }
    }
  }
}
