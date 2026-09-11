# pontobio

Páginas de links para criador de conteúdo. Um repositório, um domínio, uma pasta por perfil.

## Estrutura

```
/                 landing do serviço (pontobio.com)
/forsaken/        página de um criador (pontobio.com/forsaken/)
/modelo/          template para o próximo perfil
/hamburgueria/    cardápio digital de exemplo, com pedido pelo WhatsApp
/barbearia/       agendamento de exemplo pra barbearia, com painel do dono
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

- `whatsapp`, `instagram`, `endereco` e `mapsLink`
- `horarios` de funcionamento, `barbeiros` e `servicos` (preço e duração)
- `bloqueios` fixos que você já sabe de antemão (feriado, folga) — precisa
  editar essa lista e publicar de novo pra valer pro site público

E no topo do `<script>` de `barbearia/painel/index.html` (objeto
`CONFIG_PAINEL`):

- `senha` do painel (troque antes de publicar — é só uma trava simples,
  qualquer um que veja o código-fonte consegue ler)
- `whatsapp`, e a mesma lista de `servicos` e `barbeiros` do site público

**Importante sobre os dados:** é tudo estático, sem servidor. Os
agendamentos que o cliente faz ficam salvos só no aparelho dele (pra ele ver
"meus agendamentos"), e os agendamentos/bloqueios que o dono registra no
painel ficam salvos só no aparelho do dono — como uma agenda de papel no
balcão, não sincroniza sozinho entre aparelhos. A ponte entre os dois lados
é o WhatsApp: o cliente manda a mensagem, o dono confirma por lá e registra
no painel pra não esquecer.
