# Monitor de pré-venda de cinema

Verifica periodicamente se algum filme entrou em pré-venda e manda um alerta
no Telegram assim que detecta.

## 1. Criar o bot do Telegram

1. No Telegram, converse com **@BotFather**
2. Envie `/newbot`, escolha um nome e um username (termina em `bot`)
3. Guarde o **token** que ele te devolve (parece `123456789:AAExemplo...`)
4. Envie qualquer mensagem para o seu bot recém-criado (senão ele não consegue
   te responder)
5. Descubra seu **chat_id**: abra no navegador
   `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates` (com o token de
   verdade) depois de mandar a mensagem do passo 4 — o `chat_id` aparece no
   JSON retornado

## 2. Preencher a fonte de dados (`src/source.js`)

Esse é o único ponto que falta ajustar: a URL real de onde vêm os filmes em
pré-venda. Passo a passo pra descobrir:

1. Abra `https://www.ingresso.com/em-breve` no navegador
2. Abra o DevTools (F12) → aba **Network** → filtro **Fetch/XHR**
3. Recarregue a página e procure a chamada que devolve a lista de filmes em
   JSON (geralmente em `api-content.ingresso.com` ou domínio parecido)
4. Copie a URL e cole no lugar de `SUBSTITUIR-PELA-URL-REAL` em
   `src/source.js`
5. Ajuste o `data.movies.map(...)` pro formato real do JSON que a API
   devolveu (nomes dos campos podem ser diferentes: `title` pode ser `nome`,
   por exemplo)

Se preferir, me manda a URL e um trecho da resposta que eu ajusto isso pra
você.

## 3. Rodar localmente (teste)

```bash
cd monitor-cinema
cp .env.example .env
# preencher TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env
node src/index.js
```

## 4. Deploy 24/7 (Railway, recomendado)

Railway não derruba o serviço por inatividade (diferente do plano free do
Render, que hiberna sem tráfego HTTP — ruim pra quem faz polling contínuo).

1. Criar conta em https://railway.app e conectar sua conta do GitHub
2. **New Project** → **Deploy from GitHub repo** → escolher este repositório
3. Em **Settings**, ajustar o **Root Directory** para `monitor-cinema`
4. Em **Variables**, adicionar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` e,
   se quiser, `POLL_INTERVAL_SECONDS`
5. Deploy. Os logs mostram "Monitor de cinema no ar..." quando estiver rodando

### Alternativa: Render

Funciona do mesmo jeito (`Root Directory: monitor-cinema`, `Start Command:
npm start`, mesmas variáveis), mas no plano free o serviço hiberna após ~15
min sem receber requisição HTTP — o que interrompe o polling. Pra rodar de
verdade 24/7 no Render é preciso um plano pago, ou usar um serviço externo
de "ping" a cada poucos minutos pra manter acordado (funciona, mas é gambiarra).

## Limitações

- O estado de "quais filmes já avisei" fica em `data/seen.json`, no disco do
  próprio serviço. Se a plataforma reiniciar/redeploy o serviço e o disco não
  for persistente, pode repetir um alerta já enviado uma vez — não tem
  problema, só reenviar a mesma mensagem.
- Depende da fonte de dados continuar acessível e no mesmo formato; se o
  Ingresso.com mudar a estrutura da resposta, `src/source.js` precisa ser
  atualizado.
