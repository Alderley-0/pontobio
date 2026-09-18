// Busca a lista de filmes em pré-venda usando a API interna do Ingresso.com
// (a mesma que o app oficial e o site usam por trás dos panos).
//
// Endpoint: https://api-content.ingresso.com/v0/templates/nowplaying/{city_id}?partnership={partnership}
// Devolve um array com TODO filme comprável naquela cidade/rede, cada um com
// "premiereDate.localDate". Quando essa data está no futuro, o filme ainda
// não estreou mas já tem sessão à venda — ou seja, pré-venda aberta.
//
// Como não existe um endpoint único que devolva "todas as redes de uma
// cidade", o script testa uma lista de redes conhecidas (INGRESSO_PARTNERSHIPS)
// e junta os resultados, sem repetir filme. Rede que não opera na cidade
// configurada simplesmente não devolve nada (ou dá erro) e é ignorada.
//
// CITY_ID: número da cidade (não é o "city=sao-paulo" da URL do site).
// Pra descobrir o seu: abra no navegador
//   https://api-content.ingresso.com/v0/states/SP
// (troque SP pela sigla do seu estado) e procure sua cidade no array
// "cities" — o campo "id" é o que entra aqui.

const CITY_ID = process.env.INGRESSO_CITY_ID;

const DEFAULT_PARTNERSHIPS = [
  "cinemark",
  "kinoplex",
  "moviecom",
  "cinesystem",
  "playarte",
  "uci",
  "cinepolis",
  "arcoplex",
  "cineflix",
  "cineart",
  "cinemais",
];

const PARTNERSHIPS = process.env.INGRESSO_PARTNERSHIPS
  ? process.env.INGRESSO_PARTNERSHIPS.split(",").map((p) => p.trim()).filter(Boolean)
  : DEFAULT_PARTNERSHIPS;

const PAGE_SIZE = 50;
const MAX_PAGES = 6; // até 300 filmes por rede — bem acima do que uma cidade real tem

// O endpoint pagina por padrão (limit/skip), com um tamanho de página bem
// pequeno se não pedirmos. Sem isso, só os primeiros ~10 filmes (em ordem
// alfabética) voltavam, escondendo pré-vendas reais tipo "Duna - Parte 3".
async function fetchFromPartnership(partnership) {
  const all = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_SIZE;
    const url =
      `https://api-content.ingresso.com/v0/templates/nowplaying/${CITY_ID}` +
      `?partnership=${partnership}&limit=${PAGE_SIZE}&skip=${skip}`;

    let res;
    try {
      res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    } catch {
      break;
    }

    if (!res.ok) break;

    const movies = await res.json();
    const list = Array.isArray(movies) ? movies : [];
    all.push(...list);

    if (list.length < PAGE_SIZE) break;
  }

  console.log(`[debug] ${partnership}: ${all.length} filme(s) no total`);
  return all;
}

export async function fetchPreSaleMovies() {
  if (!CITY_ID) {
    throw new Error("Defina INGRESSO_CITY_ID nas variáveis de ambiente.");
  }

  const today = new Date().toISOString().slice(0, 10);
  const found = new Map();

  const results = await Promise.all(PARTNERSHIPS.map(fetchFromPartnership));

  for (const movies of results) {
    for (const movie of movies) {
      const premiere = movie?.premiereDate?.localDate;
      if (!premiere || premiere <= today) continue;

      const id = `${movie.title}::${premiere}`;
      if (!found.has(id)) {
        found.set(id, {
          id,
          title: movie.title,
          url: "https://www.ingresso.com/filmes/em-breve",
          poster: movie?.images?.[0]?.url ?? null,
        });
      }
    }
  }

  return [...found.values()];
}
