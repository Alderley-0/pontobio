# Monitor de pré-venda de cinema

Verifica periodicamente se algum filme entrou em pré-venda e manda um alerta
no Telegram assim que detecta. Também responde a comandos:

- `/filmes` — lista os filmes em pré-venda no momento
- `/status` — mostra quando foi a última checagem (e se deu erro)
- `/avisar <filme>` — qualquer pessoa (no privado ou num grupo) pode pedir
  aviso individual, no privado, quando aquele filme específico entrar em
  pré-venda
- `/parar <filme>` — cancela um aviso pendente
- `/minhasassinaturas` — lista os avisos pendentes de quem pediu
- `/ajuda` (ou `/help`) — mostra a lista de comandos com explicação de cada
  um (mesma mensagem que aparece no `/start`)

**Importante sobre `/avisar`:** o Telegram só deixa um bot mandar mensagem
privada pra quem já iniciou uma conversa com ele antes (dando `/start` no
chat privado do bot, fora de qualquer grupo). Quem pedir `/avisar` sem ter
feito isso ainda não vai receber o aviso — o bot fica tentando entregar a
cada checagem, silenciosamente, até a pessoa dar `/start` no privado.

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

### Mandar alerta pra um grupo também

1. Adiciona o bot no grupo
2. Manda qualquer mensagem ou comando (ex: `/status`) no grupo
3. Repete o `getUpdates` do passo 5 acima — vai aparecer uma entrada nova com
   o `chat_id` do grupo (número negativo, tipo `-1001234567890`)
4. Em `TELEGRAM_CHAT_ID`, coloca os dois separados por vírgula:
   `5543649185,-1001234567890`

O número que aparece na URL do `web.telegram.org` (ex: `#-3910517806`) **não**
é o `chat_id` de verdade — é um id interno do cliente web. Sempre pega o
número pelo `getUpdates`.

## 2. Descobrir CITY_ID

`src/source.js` já usa a API interna do Ingresso.com
(`api-content.ingresso.com/v0/templates/soon/...`), mas ela pede um
`city_id` numérico — diferente do `city=sao-paulo` que aparece na URL do
site.

1. Abra no navegador `https://api-content.ingresso.com/v0/states/UF`,
   trocando `UF` pela sigla do seu estado (ex: `SP`, `RJ`)
2. Vai aparecer um JSON com um array `cities` — ache sua cidade e copie o
   valor de `id`
3. Esse número é o `INGRESSO_CITY_ID`

Por padrão o script já checa uma lista de redes conhecidas (`cinemark`,
`kinoplex`, `moviecom`, `cinesystem`, `playarte`, `uci`, `cinepolis`,
`arcoplex`, `cineflix`, `cineart`, `cinemais`) e junta o resultado de todas
que existirem na sua cidade — as que não existem simplesmente não retornam
nada. Se quiser restringir a rede(s) específica(s), defina
`INGRESSO_PARTNERSHIPS` (separado por vírgula, ex: `cinemark,kinoplex`).

## 3. Rodar localmente (teste)

```bash
cd monitor-cinema
cp .env.example .env
# preencher TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID e INGRESSO_CITY_ID no .env
node src/index.js
```

## 4. Deploy 24/7 (Railway, recomendado)

Railway não derruba o serviço por inatividade (diferente do plano free do
Render, que hiberna sem tráfego HTTP — ruim pra quem faz polling contínuo).

1. Criar conta em https://railway.app e conectar sua conta do GitHub
2. **New Project** → **Deploy from GitHub repo** → escolher este repositório
3. Em **Settings**, ajustar o **Root Directory** para `monitor-cinema`
4. Em **Variables**, adicionar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
   `INGRESSO_CITY_ID` e, se quiser, `INGRESSO_PARTNERSHIPS` e
   `POLL_INTERVAL_SECONDS`
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
- A checagem cobre a cidade (`INGRESSO_CITY_ID`) configurada e a lista de
  redes conhecidas em `INGRESSO_PARTNERSHIPS` — não existe um endpoint único
  que devolva "todas as redes do Brasil" de uma vez, então uma rede que não
  esteja nessa lista (ou uma rede muito regional) pode passar despercebida.
- Essa API não é documentada oficialmente pelo Ingresso.com (foi obtida de
  um projeto open-source que já a usa) — pode mudar sem aviso.
