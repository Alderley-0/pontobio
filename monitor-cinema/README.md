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

## 2. Descobrir CITY_ID

`src/source.js` já usa a API interna do Ingresso.com
(`api-content.ingresso.com/v0/templates/nowplaying/...`), mas ela pede um
`city_id` numérico — diferente do `city=sao-paulo` que aparece na URL do
site.

1. Abra no navegador `https://api-content.ingresso.com/v0/states/UF`,
   trocando `UF` pela sigla do seu estado (ex: `SP`, `RJ`)
2. Vai aparecer um JSON com um array `cities` — ache sua cidade e copie o
   valor de `id`
3. Esse número é o `INGRESSO_CITY_ID`

Também dá pra trocar `INGRESSO_PARTNERSHIP` pra rede de cinema que você
acompanha (`cinemark`, `kinoplex`, `moviecom`, `cinepolis`, `uci`, etc; o
padrão é `cinemark`).

Se preferir, me manda o número que você encontrou que eu confirmo se está
certo antes do deploy.

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
   `INGRESSO_CITY_ID` e, se quiser, `INGRESSO_PARTNERSHIP` e
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
- A checagem cobre só a rede de cinema (`INGRESSO_PARTNERSHIP`) e cidade
  (`INGRESSO_CITY_ID`) configuradas — não é uma varredura de todas as redes
  do Brasil de uma vez. Pré-venda de filme grande costuma abrir no mesmo dia
  em todas as redes, então uma rede grande já serve como sinal, mas pode
  perder pré-venda exclusiva de uma rede menor.
- Essa API não é documentada oficialmente pelo Ingresso.com (foi obtida de
  um projeto open-source que já a usa) — pode mudar sem aviso.
