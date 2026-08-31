type AniListGenreResponse = {
  data?: {
    Page?: {
      media?: Array<{
        id: number;
        genres?: string[] | null;
      }>;
    };
  };
};
export type AnimeGenresById = Record<number, string[]>;
const ANILIST_URL = "https://graphql.anilist.co";
function chunkIds(ids: number[], size = 50) {
  const chunks: number[][] = [];
  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }
  return chunks;
}
async function fetchGenreChunk(ids: number[]): Promise<AnimeGenresById> {
  if (ids.length === 0) {
    return {};
  }
  const query = `
    query ($ids: [Int]) {
      Page(
        page: 1
        perPage: 50
      ) {
        media(
          id_in: $ids
          type: ANIME
          isAdult: false
        ) {
          id
          genres
        }
      }
    }
  `;
  try {
    const response = await fetch(ANILIST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        query,
        variables: {
          ids
        }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(6000)
    });
    if (!response.ok) {
      console.error("Erro ao buscar gêneros da AniList:", response.status, response.statusText);
      return {};
    }
    const data = (await response.json()) as AniListGenreResponse;
    const media = data.data?.Page
      ?.media || [];
    return media.reduce((result, anime) => {
      result[anime.id] =
        Array.from(new Set((anime.genres ||
          [])
          .map((genre) => genre.trim())
          .filter(Boolean)));
      return result;
    }, {} as AnimeGenresById);
  }
  catch (error) {
    console.error("Falha ao buscar gêneros da AniList:", error);
    return {};
  }
}
export async function getAnimeGenresByIds(animeIds: number[]): Promise<AnimeGenresById> {
  const uniqueIds = Array.from(new Set(animeIds.filter((id) => Number.isInteger(id) &&
    id > 0)));
  if (uniqueIds.length ===
    0) {
    return {};
  }
  const results = await Promise.all(chunkIds(uniqueIds).map(fetchGenreChunk));
  return Object.assign({}, ...results);
}
