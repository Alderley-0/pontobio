# pontobio

Páginas de links para criador de conteúdo. Um repositório, um domínio, uma pasta por perfil.

## Estrutura

```
/                 landing do serviço (pontobio.com)
/forsaken/        página de um criador (pontobio.com/forsaken/)
/modelo/          template para o próximo perfil
/hamburgueria/    cardápio digital de exemplo, com pedido pelo WhatsApp
/hamburgueria/painel/        painel do dono (pedidos + edição do cardápio)
/hamburgueria/firebase-config.js  configuração do Firebase usada pelos dois acima
/barbearia/       agendamento de exemplo pra barbearia, com painel do dono
/barbearia/painel/            painel do dono (agenda + edição do catálogo)
/barbearia/firebase-config.js  configuração do Firebase usada pelos acima (opcional)
/barbearia/firebase-messaging-sw.js  service worker dos avisos push (opcional)
/barbearia/firestore.rules     regras de segurança do banco (opcional)
/barbearia/firebase.json       config de deploy pra Firestore + Cloud Functions
/barbearia/functions/          Cloud Function que dispara os avisos push
/barbearia/scripts/            script pra marcar sua conta como dona (uma vez só)
/monitor-cinema/  serviço à parte (Node) que avisa pré-venda de filme no Telegram
CNAME             domínio custom do GitHub Pages
.nojekyll         impede o GitHub de processar as pastas como Jekyll
```

## Publicar pela primeira vez

1. Criar repositório público chamado `pontobio` no GitHub
2. Subir estes arquivos mantendo as pastas
3. Settings > Pages > Deploy from a branch > `main` > `/ (root)` > Save
4. Sem domínio próprio, o site fica em `SEU-USUARIO.github.io/pontobio/`
5. Com domínio: registrar na Cloudflare, manter o arquivo CNAME com o domínio,
   e no DNS da Cloudflare criar:
   - `pontobio.com` → CNAME para `SEU-USUARIO.github.io`, proxy DESLIGADO (nuvem cinza)
   - `www` → CNAME para `SEU-USUARIO.github.io`, proxy DESLIGADO

Se o domínio escolhido não for pontobio.com, muda o conteúdo do arquivo CNAME
e pronto. Nada mais no código depende do nome.

## Adicionar um novo criador

```bash
cp -r modelo NOME-DO-CRIADOR
```

Depois, dentro de `NOME-DO-CRIADOR/index.html`, trocar:

- `NOME` e `@usuario`
- a linha de bio
- os três `00 mil` do placar e os dois das tags dos links
- `CODIGO` e a frase de explicação do código
- os cinco `href="#"` dos links
- `EMAIL-DO-CRIADOR` no botão de proposta
- o `seu @ aqui` do rodapé
- a foto: salvar como `foto.jpg` na mesma pasta e trocar o bloco `.avatar`

Por último, adicionar o link do novo perfil na seção Exemplos do `index.html` da raiz.

## Regra

Só entra número que o criador confirmou ou que dá para ver no perfil dele.
Página com dado inventado sobre o próprio canal queima a venda na hora.

## Cardápio digital (hamburgueria)

`/hamburgueria/index.html` é um cardápio de exemplo (Chama Burger) em arquivo
único, sem build: categorias, busca, montagem de item com opções e adicionais,
sacola e envio do pedido pelo WhatsApp. Antes de publicar, trocar em
`CARDAPIO` (topo do `<script>`):

- `loja.whatsapp`: número real, só dígitos (55 + DDD + número)
- itens, preços, fotos e horários — são todos de exemplo
- `loja.taxaEntrega`, `loja.pedidoMinimo` e `loja.pagamentos`

Para pedido por mesa, gerar um QR code por mesa apontando para
`.../hamburgueria/?mesa=12` (troque o número por mesa).

## Painel do dono (pedidos + edição do cardápio)

`/hamburgueria/painel/index.html` é o painel interno onde o dono acompanha os
pedidos em tempo real (com status: novo → preparando → saiu p/ entrega/pronto
→ concluído) e edita preços, disponibilidade e dados da loja sem mexer em
código. Ele só funciona com um projeto Firebase configurado — sem isso, o
próprio painel avisa "não configurado" e o cardápio continua funcionando
normalmente (só sem histórico de pedidos nem painel).

### Configurar o Firebase (grátis)

1. Crie um projeto em https://console.firebase.google.com (grátis, sem cartão)
2. **Firestore Database** → criar banco → modo produção → escolher uma região
3. **Authentication** → Sign-in method → ativar **E-mail/senha**
4. Authentication → Users → **Add user** → crie o login do dono (e-mail + senha)
5. ⚙ Configurações do projeto → Seus apps → `</>` (Web) → registre um app e
   copie os valores gerados
6. Cole esses valores em `hamburgueria/firebase-config.js`, no lugar de cada
   `'COLE_AQUI'`
7. Firestore Database → **Regras**, cole e publique:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pedidos/{pedidoId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /cardapio/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Essas regras deixam qualquer cliente criar um pedido (ele não faz login), mas
só quem estiver logado (o dono) consegue ler os pedidos, mudar status ou
editar o cardápio.

### Como usar

- Abra `/hamburgueria/painel/` e entre com o e-mail/senha criados no passo 4
- Aba **Pedidos**: lista em tempo real, com filtro "Hoje"/"Todos" e botão pra
  avançar o status de cada pedido
- Aba **Cardápio**: preço e disponibilidade de cada item direto na tela; para
  adicionar/remover itens, categorias, opções, horários etc., use a "Edição
  avançada (JSON)" — edite o JSON e clique em "Aplicar", depois em
  "Salvar cardápio"
- O cardápio que os clientes veem no site busca essa mesma informação do
  Firestore a cada carregamento (e a cada 5 minutos), com o cardápio local do
  arquivo como reserva se o Firebase estiver fora do ar

O WhatsApp continua sendo o canal principal de aviso do pedido — o Firestore
é só o histórico/painel, não substitui o envio da mensagem.

## Agendamento (barbearia)

`/barbearia/index.html` é a página pública de agendamento (Barba Nobre, de
exemplo): o cliente escolhe serviço, barbeiro, data e horário, preenche nome e
WhatsApp, e ao confirmar abre o WhatsApp com a mensagem pronta pra enviar pra
barbearia. `/barbearia/painel/index.html` é o painel do dono, protegido por
senha simples, pra manter a agenda organizada depois de confirmar com o
cliente pelo WhatsApp (criar/concluir/cancelar agendamento, bloquear datas e
horários).

Antes de publicar, trocar no topo do `<script>` de `barbearia/index.html`
(objeto `BARBEARIA`):

- `whatsapp`, `instagram` e `endereco` (o link do mapa é gerado sozinho a
  partir do endereço)
- `horarios` de funcionamento, `barbeiros` e `servicos` (preço e duração)
- `bloqueios` fixos que você já sabe de antemão (feriado, folga) — precisa
  editar essa lista e publicar de novo pra valer pro site público

E no topo do `<script>` de `barbearia/painel/index.html` (objeto
`CONFIG_PAINEL`):

- `senha` do painel (troque antes de publicar — é só uma trava simples,
  qualquer um que veja o código-fonte consegue ler)
- `whatsapp`, e a mesma lista de `servicos` e `barbeiros` do site público

**Importante sobre os dados sem Firebase:** é tudo estático, sem servidor.
Os agendamentos que o cliente faz ficam salvos só no aparelho dele (pra ele
ver "meus agendamentos"), e os agendamentos/bloqueios que o dono registra no
painel ficam salvos só no aparelho do dono — como uma agenda de papel no
balcão, não sincroniza sozinho entre aparelhos. A ponte entre os dois lados
é o WhatsApp: o cliente manda a mensagem, o dono confirma por lá e registra
no painel pra não esquecer.

### Catálogo em tempo real (opcional, Firebase)

Com um projeto Firebase configurado, o painel ganha uma aba **Catálogo** onde
o dono edita nome da loja, WhatsApp, Instagram, endereço, serviços (nome,
preço, duração), barbeiros e horário de funcionamento direto na tela — sem
mexer em código nem publicar nada. O site público (`barbearia/index.html`)
busca esses dados no Firestore e atualiza sozinho em até 5 minutos (ou na
próxima visita), com os dados de exemplo do arquivo como reserva se o
Firebase estiver fora do ar ou não configurado.

Fazer login nessa aba também liga a sincronização automática da **Agenda**:
os agendamentos feitos pelo site passam a aparecer sozinhos no painel (sem
precisar digitar cada um na mão), e os agendamentos criados no painel ficam
disponíveis em qualquer aparelho em que o dono entrar com a mesma conta. Sem
esse login, tudo continua funcionando exatamente como antes (agenda e
bloqueios salvos só no aparelho, catálogo editado no código).

### Conta do cliente (opcional, Firebase)

No site público, o cliente pode criar uma conta (e-mail/senha, pelo link
"Entrar / Criar conta" no rodapé) — isso é **opcional**: sem conta, o
agendamento continua funcionando exatamente como antes (salvo só naquele
aparelho). Com conta, os agendamentos ficam ligados a ela e aparecem em
"Meus agendamentos" em qualquer aparelho em que o cliente entrar, e ele
mesmo pode cancelar um horário direto por ali (o pedido de cancelamento
também abre o WhatsApp, como já acontecia).

### Configurar o Firebase (catálogo + contas de cliente)

Mesmos passos do cardápio da hamburgueria — dá pra reusar o mesmo projeto
Firebase ou criar um novo só pra barbearia:

1. Crie um projeto grátis em https://console.firebase.google.com
2. **Firestore Database** → criar banco → modo produção → escolher uma região
3. **Authentication** → Sign-in method → ativar **E-mail/senha**
4. Authentication → Users → **Add user** → crie o login do dono
5. ⚙ Configurações do projeto → Seus apps → `</>` (Web) → registre um app e
   copie os valores gerados
6. Cole esses valores em `barbearia/firebase-config.js`, no lugar de cada
   `'COLE_AQUI'`
7. **Marque sua conta como dona** — isso é o que diferencia sua conta das
   contas comuns de cliente perante as regras de segurança abaixo:
   ```bash
   cd barbearia/scripts
   npm install firebase-admin --no-save
   gcloud auth application-default login
   node definir-dono.js seu@email.com SEU_PROJECT_ID
   ```
   Depois de rodar, saia e entre de novo no painel (aba Catálogo) — o
   navegador só busca a marcação nova ao logar de novo.
8. Firestore Database → **Regras**, cole o conteúdo de
   `barbearia/firestore.rules` e publique (ou rode
   `firebase deploy --only firestore:rules` de dentro da pasta
   `barbearia/`, com a CLI do Firebase instalada e logada).

As regras (em `barbearia/firestore.rules`, já testadas com o emulador do
Firestore) deixam: qualquer um ler o catálogo e criar um agendamento (sem
precisar de conta); um cliente logado ler e cancelar só os próprios
agendamentos; e só a conta marcada como dona ler a agenda inteira, editar o
catálogo, mudar qualquer status ou excluir um agendamento.

### Avisos push pro barbeiro (opcional, Cloud Functions)

Com isso ligado, o dono recebe um aviso no celular quando um cliente cancela
um horário — **mesmo com o painel fechado**. Sem isso, o cancelamento
continua chegando pelo WhatsApp (como sempre) e aparecendo na hora na Agenda
se o painel estiver aberto num aparelho logado.

Como esse aviso roda em segundo plano (sem alguém com o site aberto pra
disparar nada), ele depende de uma Cloud Function — o que exige colocar o
projeto Firebase no plano **Blaze** (pago por uso; o uso de uma barbearia
fica bem dentro da faixa gratuita mensal, mas o plano em si pede um cartão
cadastrado como garantia):

1. No [console do Firebase](https://console.firebase.google.com), ⚙ →
   **Uso e faturamento** → **Detalhes e configurações do plano** → mude pra
   **Blaze**
2. **Cloud Messaging** → aba **Configuração da Web** → **Gerar par de
   chaves** → copie o valor gerado
3. Cole esse valor em `barbearia/firebase-config.js`, em
   `FIREBASE_VAPID_KEY` (no lugar de `'COLE_AQUI'`)
4. Publique a função (num Cloud Shell ou terminal com `gcloud`/`firebase`
   autenticados nesse projeto):
   ```bash
   git clone https://github.com/Alderley-0/pontobio.git
   cd pontobio/barbearia
   firebase deploy --only firestore:rules,functions --project SEU_PROJECT_ID
   ```
5. No painel, aba **Catálogo**, logado com a conta do dono: botão
   **"Ativar avisos neste aparelho"** — o navegador vai pedir permissão de
   notificação; aceite

A função (`barbearia/functions/index.js`) só dispara quando um
`agendamentos/{id}` muda de status **para** `cancelado`, manda o aviso pra
todos os aparelhos do dono que já ativaram (coleção `donoDispositivos`), e
limpa sozinha os tokens de aparelhos que pararam de responder (app
desinstalado, permissão revogada etc.).
