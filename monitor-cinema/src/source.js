// Busca a lista de filmes em pré-venda usando a API interna do Ingresso.com
// (a mesma que o app oficial e o site usam por trás dos panos).
//
// Endpoint: https://api-content.ingresso.com/v0/templates/soon/{city_id}?partnership={partnership}
// Devolve o catálogo completo de "em breve" daquela cidade/rede, cada item
// com "premiereDate.localDate". Quando essa data está no futuro, o filme
// ainda não estreou mas já tem sessão à venda — ou seja, pré-venda aberta.
//
// (existe também templates/nowplaying, mas esse devolve só uma "vitrine" de
// ~10 destaques em ordem alfabética, ignorando limit/skip — não serve pra
// varrer o catálogo inteiro.)
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

async function fetchFromPartnership(partnership) {
  const url = `https://api-content.ingresso.com/v0/templates/soon/${CITY_ID}?partnership=${partnership}`;

  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  } catch {
    return [];
  }

  if (!res.ok) return [];

  const movies = await res.json();
  return Array.isArray(movies) ? movies : [];
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
