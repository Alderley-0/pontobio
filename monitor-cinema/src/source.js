// Busca a lista de filmes em pré-venda.
//
// TODO: este é o único arquivo que precisa da URL real. Pra descobrir:
// 1. Abra https://www.ingresso.com/em-breve no navegador
// 2. Abra o DevTools (F12) > aba "Network" > filtro "Fetch/XHR"
// 3. Recarregue a página e procure a chamada que traz a lista de filmes
//    (normalmente algo em api-content.ingresso.com ou similar)
// 4. Copie a URL e o formato da resposta (JSON) e ajuste a função abaixo.
//
// Cada filme retornado deve virar um objeto:
//   { id: string, title: string, url: string }
// "id" precisa ser estável entre chamadas (não pode mudar a cada request),
// pra o sistema saber que já avisou sobre aquele filme.

export async function fetchPreSaleMovies() {
  const res = await fetch("https://SUBSTITUIR-PELA-URL-REAL");

  if (!res.ok) {
    throw new Error(`Fonte respondeu ${res.status}`);
  }

  const data = await res.json();

  // Ajustar o mapeamento abaixo conforme o formato real da resposta.
  return data.movies.map((movie) => ({
    id: String(movie.id),
    title: movie.title,
    url: movie.url,
  }));
}
