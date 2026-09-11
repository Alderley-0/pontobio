# pontobio

Páginas de links para criador de conteúdo. Um repositório, um domínio, uma pasta por perfil.

## Estrutura

```
/                 landing do serviço (pontobio.com)
/forsaken/        página de um criador (pontobio.com/forsaken/)
/modelo/          template para o próximo perfil
/hamburgueria/    cardápio digital de exemplo, com pedido pelo WhatsApp
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
