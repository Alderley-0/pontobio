// Busca a lista de filmes em pré-venda usando a API interna do Ingresso.com
// (a mesma que o app oficial e o site usam por trás dos panos).
//
// Endpoint: https://api-content.ingresso.com/v0/templates/nowplaying/{city_id}?partnership={partnership}
// Devolve um array com TODO filme comprável naquela cidade/rede, cada um com
// "premiereDate.localDate". Quando essa data está no futuro, o filme ainda
// não estreou mas já tem sessão à venda — ou seja, pré-venda aberta.
//
// CITY_ID: número da cidade (não é o "city=sao-paulo" da URL do site).
// Pra descobrir o seu: abra no navegador
//   https://api-content.ingresso.com/v0/states/SP
// (troque SP pela sigla do seu estado) e procure sua cidade no array
// "cities" — o campo "id" é o que entra aqui.
//
// PARTNERSHIP: nome da rede de cinema (ex: "cinemark", "kinoplex",
// "moviecom", "cinepolis", "uci"). Cobre só a rede escolhida, não todas as
// redes do país — pré-venda de filme grande costuma abrir no mesmo dia em
// todas, então uma rede grande já serve de sinal.

const CITY_ID = process.env.INGRESSO_CITY_ID;
const PARTNERSHIP = process.env.INGRESSO_PARTNERSHIP ?? "cinemark";

export async function fetchPreSaleMovies() {
  if (!CITY_ID) {
    throw new Error("Defina INGRESSO_CITY_ID nas variáveis de ambiente.");
  }

  const url = `https://api-content.ingresso.com/v0/templates/nowplaying/${CITY_ID}?partnership=${PARTNERSHIP}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    throw new Error(`Fonte respondeu ${res.status}`);
  }

  const movies = await res.json();
  const today = new Date().toISOString().slice(0, 10);

  return movies
    .filter((movie) => {
      const premiere = movie?.premiereDate?.localDate;
      return premiere && premiere > today;
    })
    .map((movie) => ({
      id: `${movie.title}::${movie.premiereDate.localDate}`,
      title: movie.title,
      url: `https://www.ingresso.com/filmes/em-breve`,
    }));
}
