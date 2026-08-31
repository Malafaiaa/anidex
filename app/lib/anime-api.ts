export type Anime = {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number | null;
  episodes: number | null;
  status: string;
};
export type AnimeDetails = Anime & {
  malId: number | null;
  description: string;
  genres: string[];
  year: number | null;
  format: string | null;
  duration: number | null;
  bannerImage: string | null;
};
export type AnimeEpisode = {
  number: number;
  title: string;
  titleRomanji: string | null;
  titleJapanese: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  score: number | null;
};
export type AnimeEpisodesResult = {
  episodes: AnimeEpisode[];
  pagination: {
    currentPage: number;
    hasNextPage: boolean;
    lastPage: number;
  };
  isFallback: boolean;
};
type AniListMedia = {
  id: number;
  idMal?: number | null;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage?: string | null;
  description?: string | null;
  genres?: string[];
  seasonYear?: number | null;
  format?: string | null;
  duration?: number | null;
  averageScore: number | null;
  episodes: number | null;
  status: string;
};
type SearchAnimeResult = {
  animes: Anime[];
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
  };
};
export type AnimeCatalogResult = {
  animes: Anime[];
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
  };
};
type AnivexSearchAnime = {
  id?: number;
  slug?: string;
  title?: string;
  title_english?: string | null;
};
type AnivexAnimeDetails = {
  id?: number;
  slug?: string;
  title?: string;
  title_english?: string | null;
  synopsis?: string | null;
};
type JikanEpisode = {
  mal_id: number;
  title: string;
  title_japanese?: string | null;
  title_romanji?: string | null;
  aired?: string | null;
  score?: number | null;
  filler?: boolean;
  recap?: boolean;
};
type JikanEpisodeResponse = {
  data?: JikanEpisode[];
  pagination?: {
    last_visible_page?: number;
    has_next_page?: boolean;
  };
};
const USE_JIKAN = process.env.USE_JIKAN !== "false";
async function requestAniList(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    }),
    next: {
      revalidate: 3600
    }
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro AniList:", response.status, response.statusText, errorBody);
    return null;
  }
  return response.json();
}
function formatStatus(status: string) {
  switch (status) {
    case "FINISHED":
      return "Finalizado";
    case "RELEASING":
      return "Em lançamento";
    case "NOT_YET_RELEASED":
      return "Ainda não lançado";
    case "CANCELLED":
      return "Cancelado";
    case "HIATUS":
      return "Em hiato";
    default:
      return status;
  }
}
function formatAnime(anime: AniListMedia): Anime {
  return {
    mal_id: anime.id,
    title: anime.title.english ||
      anime.title.romaji,
    images: {
      jpg: {
        image_url: anime.coverImage.large,
        large_image_url: anime.coverImage.extraLarge
      }
    },
    score: anime.averageScore !== null
      ? anime.averageScore / 10
      : null,
    episodes: anime.episodes,
    status: formatStatus(anime.status)
  };
}
function cleanDescription(description: string | null | undefined) {
  if (!description) {
    return "Nenhuma sinopse disponível.";
  }
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\(Source:[\s\S]*?\)$/gi, "")
    .replace(/\(Fonte:[\s\S]*?\)$/gi, "")
    .trim();
}
async function getPortugueseSynopsis(title: string): Promise<string | null> {
  try {
    const searchUrl = `https://www.anivex.org/api/anime/search?q=${encodeURIComponent(title)}&per_page=5`;
    const searchResponse = await fetch(searchUrl, {
      cache: "no-store"
    });
    if (!searchResponse.ok) {
      console.error("Erro pesquisa Anivex:", searchResponse.status);
      return null;
    }
    const searchJson = await searchResponse.json();
    const results: AnivexSearchAnime[] = Array.isArray(searchJson?.data)
      ? searchJson.data
      : [];
    if (results.length === 0) {
      return null;
    }
    const normalizedTitle = title
      .toLowerCase()
      .trim();
    const exactMatch = results.find((anime) => {
      const mainTitle = anime.title
        ?.toLowerCase()
        .trim();
      const englishTitle = anime.title_english
        ?.toLowerCase()
        .trim();
      return (mainTitle === normalizedTitle ||
        englishTitle === normalizedTitle);
    });
    const selectedAnime = exactMatch ||
      results[0];
    if (!selectedAnime.slug &&
      !selectedAnime.id) {
      return null;
    }
    const identifier = selectedAnime.slug ||
      selectedAnime.id;
    const detailsResponse = await fetch(`https://www.anivex.org/api/anime/${identifier}`, {
      cache: "no-store"
    });
    if (!detailsResponse.ok) {
      console.error("Erro detalhes Anivex:", detailsResponse.status);
      return null;
    }
    const detailsJson = await detailsResponse.json();
    const details: AnivexAnimeDetails | undefined = detailsJson?.data;
    if (!details) {
      return null;
    }
    const synopsis = details.synopsis;
    if (typeof synopsis !== "string" ||
      synopsis.trim().length === 0) {
      return null;
    }
    return cleanDescription(synopsis);
  }
  catch (error) {
    console.error("Erro ao buscar sinopse em português:", error);
    return null;
  }
}
export async function getTopAnime(): Promise<Anime[]> {
  const query = `
    query {
      Page(
        page: 1
        perPage: 12
      ) {
        media(
          type: ANIME
          sort: TRENDING_DESC
          isAdult: false
        ) {
          id

          title {
            romaji
            english
          }

          coverImage {
            large
            extraLarge
          }

          averageScore
          episodes
          status
        }
      }
    }
  `;
  try {
    const data = await requestAniList(query);
    if (!data) {
      return [];
    }
    return data.data.Page.media.map(formatAnime);
  }
  catch (error) {
    console.error("Erro ao buscar animes:", error);
    return [];
  }
}
export async function searchAnime(search: string, page = 1): Promise<SearchAnimeResult> {
  const query = `
    query (
      $search: String
      $page: Int
    ) {
      Page(
        page: $page
        perPage: 12
      ) {
        pageInfo {
          currentPage
          hasNextPage
        }

        media(
          search: $search
          type: ANIME
          isAdult: false
          sort: SEARCH_MATCH
        ) {
          id

          title {
            romaji
            english
          }

          coverImage {
            large
            extraLarge
          }

          averageScore
          episodes
          status
        }
      }
    }
  `;
  try {
    const data = await requestAniList(query, {
      search,
      page
    });
    if (!data) {
      return {
        animes: [],
        pageInfo: {
          currentPage: page,
          hasNextPage: false
        }
      };
    }
    const pageData = data.data.Page;
    return {
      animes: pageData.media.map(formatAnime),
      pageInfo: {
        currentPage: pageData.pageInfo.currentPage,
        hasNextPage: pageData.pageInfo.hasNextPage
      }
    };
  }
  catch (error) {
    console.error("Erro ao pesquisar anime:", error);
    return {
      animes: [],
      pageInfo: {
        currentPage: page,
        hasNextPage: false
      }
    };
  }
}
function animeStartsWithLetter(anime: AniListMedia, letter: string) {
  const displayedTitle = anime.title.english ||
    anime.title.romaji ||
    "";
  return displayedTitle
    .trim()
    .toUpperCase()
    .startsWith(letter);
}
function animeStartsWithSymbolOrNumber(anime: AniListMedia) {
  const title = anime.title.english ||
    anime.title.romaji ||
    "";
  const first = title
    .trim()
    .charAt(0)
    .toUpperCase();
  return !/^[A-Z]$/.test(first);
}
async function getAniListCatalogCandidates(search: string | null): Promise<AniListMedia[]> {
  const searchPages = search ? 6 : 0;
  const popularPages = 2;
  const perPage = 50;
  const mediaFields = `
    id

    title {
      romaji
      english
    }

    coverImage {
      large
      extraLarge
    }

    averageScore
    episodes
    status
  `;
  const searchBlocks = search
    ? Array.from({
      length: searchPages
    }, (_, index) => {
      const page = index + 1;
      return `
              search${page}: Page(
                page: ${page}
                perPage: ${perPage}
              ) {
                media(
                  search: $search
                  type: ANIME
                  isAdult: false
                  sort: SEARCH_MATCH
                ) {
                  ${mediaFields}
                }
              }
            `;
    }).join("\n")
    : "";
  const popularBlocks = Array.from({
    length: popularPages
  }, (_, index) => {
    const page = index + 1;
    return `
          popular${page}: Page(
            page: ${page}
            perPage: ${perPage}
          ) {
            media(
              type: ANIME
              isAdult: false
              sort: POPULARITY_DESC
            ) {
              ${mediaFields}
            }
          }
        `;
  }).join("\n");
  const query = `
    query ($search: String) {
      ${searchBlocks}
      ${popularBlocks}
    }
  `;
  try {
    const data = await requestAniList(query, {
      search: search ?? undefined
    });
    if (!data?.data) {
      return [];
    }
    const collected = new Map<number, AniListMedia>();
    for (let page = 1; page <= searchPages; page += 1) {
      const media = data.data[`search${page}`]?.media ?? [];
      for (const anime of media) {
        collected.set(anime.id, anime);
      }
    }
    for (let page = 1; page <= popularPages; page += 1) {
      const media = data.data[`popular${page}`]?.media ?? [];
      for (const anime of media) {
        collected.set(anime.id, anime);
      }
    }
    return Array.from(collected.values());
  }
  catch (error) {
    console.error("Erro ao montar catálogo AniList:", error);
    return [];
  }
}
export async function getAnimeCatalog(letter = "ALL", page = 1): Promise<AnimeCatalogResult> {
  const normalizedLetter = letter
    .trim()
    .toUpperCase();
  const currentPage = Math.max(1, page);
  const perPage = 24;
  if (normalizedLetter === "ALL") {
    const query = `
      query ($page: Int) {
        Page(
          page: $page
          perPage: 24
        ) {
          pageInfo {
            currentPage
            hasNextPage
          }

          media(
            type: ANIME
            isAdult: false
            sort: POPULARITY_DESC
          ) {
            id

            title {
              romaji
              english
            }

            coverImage {
              large
              extraLarge
            }

            averageScore
            episodes
            status
          }
        }
      }
    `;
    try {
      const data = await requestAniList(query, {
        page: currentPage
      });
      if (!data?.data?.Page) {
        return {
          animes: [],
          pageInfo: {
            currentPage,
            hasNextPage: false
          }
        };
      }
      return {
        animes: data.data.Page.media.map(formatAnime),
        pageInfo: {
          currentPage: data.data.Page.pageInfo
            .currentPage,
          hasNextPage: data.data.Page.pageInfo
            .hasNextPage
        }
      };
    }
    catch (error) {
      console.error("Erro no catálogo geral:", error);
      return {
        animes: [],
        pageInfo: {
          currentPage,
          hasNextPage: false
        }
      };
    }
  }
  if (/^[A-Z]$/.test(normalizedLetter)) {
    const candidates = await getAniListCatalogCandidates(normalizedLetter);
    const filtered = candidates
      .filter((anime) => animeStartsWithLetter(anime, normalizedLetter))
      .sort((a, b) => {
        const titleA = a.title.english ||
          a.title.romaji;
        const titleB = b.title.english ||
          b.title.romaji;
        return titleA.localeCompare(titleB, "en", {
          sensitivity: "base"
        });
      });
    const start = (currentPage - 1) *
      perPage;
    const end = start + perPage;
    return {
      animes: filtered
        .slice(start, end)
        .map(formatAnime),
      pageInfo: {
        currentPage,
        hasNextPage: end <
          filtered.length
      }
    };
  }
  if (normalizedLetter === "#") {
    const candidates = await getAniListCatalogCandidates(null);
    const filtered = candidates
      .filter(animeStartsWithSymbolOrNumber)
      .sort((a, b) => {
        const titleA = a.title.english ||
          a.title.romaji;
        const titleB = b.title.english ||
          b.title.romaji;
        return titleA.localeCompare(titleB, "en", {
          sensitivity: "base"
        });
      });
    const start = (currentPage - 1) *
      perPage;
    const end = start + perPage;
    return {
      animes: filtered
        .slice(start, end)
        .map(formatAnime),
      pageInfo: {
        currentPage,
        hasNextPage: end <
          filtered.length
      }
    };
  }
  return {
    animes: [],
    pageInfo: {
      currentPage,
      hasNextPage: false
    }
  };
}
export async function getAnimeById(id: number): Promise<AnimeDetails | null> {
  const query = `
    query ($id: Int) {
      Media(
        id: $id
        type: ANIME
      ) {
        id
        idMal

        title {
          romaji
          english
        }

        coverImage {
          large
          extraLarge
        }

        bannerImage
        description
        genres
        seasonYear
        format
        duration
        averageScore
        episodes
        status
      }
    }
  `;
  try {
    const data = await requestAniList(query, {
      id
    });
    if (!data?.data?.Media) {
      return null;
    }
    const anime: AniListMedia = data.data.Media;
    const formattedAnime = formatAnime(anime);
    const portugueseSynopsis = await getPortugueseSynopsis(formattedAnime.title);
    const description = portugueseSynopsis ||
      cleanDescription(anime.description);
    return {
      ...formattedAnime,
      malId: anime.idMal ?? null,
      description,
      genres: anime.genres || [],
      year: anime.seasonYear || null,
      format: anime.format || null,
      duration: anime.duration || null,
      bannerImage: anime.bannerImage || null
    };
  }
  catch (error) {
    console.error("Erro ao buscar detalhes do anime:", error);
    return null;
  }
}
export async function getAnimeEpisodes(malId: number, totalEpisodes: number | null, page = 1): Promise<AnimeEpisodesResult> {
  function createFallback(): AnimeEpisodesResult {
    if (!totalEpisodes ||
      totalEpisodes <= 0) {
      return {
        episodes: [],
        pagination: {
          currentPage: page,
          hasNextPage: false,
          lastPage: page
        },
        isFallback: true
      };
    }
    const perPage = 100;
    const lastPage = Math.ceil(totalEpisodes / perPage);
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, totalEpisodes);
    if (start > totalEpisodes) {
      return {
        episodes: [],
        pagination: {
          currentPage: page,
          hasNextPage: false,
          lastPage
        },
        isFallback: true
      };
    }
    const episodes: AnimeEpisode[] = Array.from({
      length: end - start + 1
    }, (_, index) => {
      const episodeNumber = start + index;
      return {
        number: episodeNumber,
        title: `Episódio ${episodeNumber}`,
        titleRomanji: null,
        titleJapanese: null,
        aired: null,
        filler: false,
        recap: false,
        score: null
      };
    });
    return {
      episodes,
      pagination: {
        currentPage: page,
        hasNextPage: page < lastPage,
        lastPage
      },
      isFallback: true
    };
  }
  if (!USE_JIKAN) {
    console.log("Jikan desabilitado manualmente. Usando AniList.");
    return createFallback();
  }
  const url = `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`;
  try {
    console.log("Buscando episódios no Jikan:", url);
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      console.warn("Jikan indisponível:", response.status, response.statusText);
      console.log("Usando fallback da AniList.");
      return createFallback();
    }
    const data: JikanEpisodeResponse = await response.json();
    if (!data.data ||
      data.data.length === 0) {
      console.warn("Jikan não retornou episódios.");
      console.log("Usando fallback da AniList.");
      return createFallback();
    }
    const episodes = data.data.map((episode): AnimeEpisode => ({
      number: episode.mal_id,
      title: episode.title ||
        `Episódio ${episode.mal_id}`,
      titleRomanji: episode.title_romanji ??
        null,
      titleJapanese: episode.title_japanese ??
        null,
      aired: episode.aired ??
        null,
      filler: episode.filler ??
        false,
      recap: episode.recap ??
        false,
      score: episode.score ??
        null
    }));
    console.log(`Jikan retornou ${episodes.length} episódios.`);
    return {
      episodes,
      pagination: {
        currentPage: page,
        hasNextPage: data.pagination
          ?.has_next_page ??
          false,
        lastPage: data.pagination
          ?.last_visible_page ??
          page
      },
      isFallback: false
    };
  }
  catch (error) {
    console.error("Erro ao acessar Jikan:", error);
    console.log("Usando fallback da AniList.");
    return createFallback();
  }
}
