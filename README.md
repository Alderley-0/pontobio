# pontobio

Páginas de links para criador de conteúdo. Um repositório, um domínio, uma pasta por perfil.

## Estrutura

```
/                 landing do serviço (mrzeus.co.uk)
/forsaken/        página de um criador (mrzeus.co.uk/forsaken/)
/modelo/          template para o próximo perfil
/academia/        página de exemplo de coach de academia
/barbearia/       agendamento de exemplo pra barbearia, com painel do dono
/barbearia/painel/            painel do dono (agenda + edição do catálogo)
/barbearia/firebase-config.js  configuração do Firebase usada pelos acima (opcional)
/barbearia/firebase-messaging-sw.js  service worker dos avisos push (opcional)
/barbearia/firestore.rules     regras de segurança do banco (opcional)
/barbearia/firebase.json       config de deploy pra Firestore + Cloud Functions
/barbearia/functions/          Cloud Function que dispara os avisos push
/barbearia/scripts/            script pra marcar sua conta como dona (uma vez só)
CNAME             domínio custom do GitHub Pages
.nojekyll         impede o GitHub de processar as pastas como Jekyll
```

O monitor de pré-venda de cinema (Telegram) saiu daqui e agora mora no
repositório próprio `Alderley-0/monitor-cinema`.

## Publicar pela primeira vez

1. Criar repositório público chamado `pontobio` no GitHub
2. Subir estes arquivos mantendo as pastas
3. Settings > Pages > Deploy from a branch > `main` > `/ (root)` > Save
4. Sem domínio próprio, o site fica em `SEU-USUARIO.github.io/pontobio/`
5. Com domínio: registrar na Cloudflare, manter o arquivo CNAME com o domínio,
   e no DNS da Cloudflare criar:
   - `mrzeus.co.uk` → CNAME para `SEU-USUARIO.github.io`, proxy DESLIGADO (nuvem cinza)
   - `www` → CNAME para `SEU-USUARIO.github.io`, proxy DESLIGADO

O domínio em uso hoje é `mrzeus.co.uk`. Pra trocar, muda o conteúdo do arquivo
CNAME e pronto. Nada mais no código depende do nome.

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

## Agendamento (barbearia)

`/barbearia/index.html` é a página pública de agendamento (Barba Nobre, de
exemplo): o cliente escolhe serviço, barbeiro, data e horário, preenche nome e
WhatsApp, e ao confirmar abre o WhatsApp com a mensagem pronta pra enviar pra
barbearia. `/barbearia/painel/index.html` é o painel do dono, pra manter a
agenda organizada depois de confirmar com o cliente pelo WhatsApp
(criar/concluir/cancelar agendamento, bloquear datas e horários). Com o
Firebase configurado (como está hoje), a entrada do painel exige a conta de
dono do Firebase; contas de cliente são recusadas.

Antes de publicar, trocar no topo do `<script>` de `barbearia/index.html`
(objeto `BARBEARIA`):

- `whatsapp`, `instagram` e `endereco` (o link do mapa é gerado sozinho a
  partir do endereço)
- `horarios` de funcionamento, `barbeiros` e `servicos` (preço e duração)
- `bloqueios` fixos que você já sabe de antemão (feriado, folga) — precisa
  editar essa lista e publicar de novo pra valer pro site público

E no topo do `<script>` de `barbearia/painel/index.html` (objeto
`CONFIG_PAINEL`):

- `senha`: só vale se o Firebase **não** estiver configurado. É uma trava
  simples (qualquer um que veja o código-fonte consegue ler) e vem vazia, ou
  seja, o painel fica trancado até você definir uma
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

O login de dono (feito na entrada do painel) também liga a sincronização
automática da **Agenda**:
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

Dá pra reusar um projeto Firebase que você já tenha ou criar um novo só pra
barbearia:

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

As regras (em `barbearia/firestore.rules`) deixam: qualquer um ler o catálogo
e criar um agendamento pelo site (sem precisar de conta, mas só com os campos
que o site manda, tamanhos limitados e status inicial fixo); um cliente logado ler e cancelar só os próprios
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
