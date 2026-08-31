import SiteHeader from "../../../components/SiteHeader";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CirclePlay, Info, Star } from "lucide-react";
import { getAnimeById, getAnimeEpisodes } from "../../../lib/anime-api";
type EpisodesPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
};
function formatDate(date: string | null) {
  if (!date) {
    return "Data não informada";
  }
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date(date));
  }
  catch {
    return "Data não informada";
  }
}
export default async function EpisodesPage({ params, searchParams }: EpisodesPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const animeId = Number(id);
  const currentPage = Math.max(1, Number(query.page) || 1);
  if (Number.isNaN(animeId) ||
    animeId <= 0) {
    return (<main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Anime inválido
        </h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>
    </main>);
  }
  const anime = await getAnimeById(animeId);
  if (!anime) {
    return (<main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
      <div className="max-w-md text-center">
        <Info className="mx-auto h-10 w-10 text-violet-400" />
        <h1 className="mt-5 text-3xl font-bold">
          Anime não encontrado
        </h1>
        <p className="mt-3 leading-7 text-zinc-500">
          Não conseguimos localizar as informações deste anime.
        </p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>
    </main>);
  }
  const fallbackMalId = anime.malId ?? 0;
  const result = await getAnimeEpisodes(fallbackMalId, anime.episodes, currentPage);
  const { episodes, pagination, isFallback } = result;
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader showNav={false} backHref={`/anime/${animeId}`} backLabel="Voltar para detalhes" />
    <section className="border-b border-white/5 bg-gradient-to-b from-violet-950/10 to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
          <CirclePlay className="h-5 w-5" />
          Episódios
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          {anime.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span>
            {anime.episodes
              ? `${anime.episodes} episódios`
              : "Quantidade não informada"}
          </span>
          <span className="text-zinc-700">
            •
          </span>
          <span>
            Página {currentPage}
          </span>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-12">
      {isFallback &&
        episodes.length > 0 && (<div className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Info className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-200">
                Informações simplificadas dos episódios
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Os detalhes dos episódios estão
                temporariamente indisponíveis.
                A lista foi gerada usando a
                quantidade total informada pela
                AniList.
              </p>
            </div>
          </div>
        </div>)}
      {episodes.length === 0 ? (<div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
        <CirclePlay className="mx-auto h-10 w-10 text-zinc-600" />
        <h2 className="mt-5 text-2xl font-bold">
          Nenhum episódio encontrado
        </h2>
        <p className="mt-2 text-zinc-500">
          Não foi possível encontrar a
          quantidade de episódios deste anime.
        </p>
      </div>) : (<div className="grid gap-3">
        {episodes.map((episode) => (<article key={episode.number} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-violet-500/30 hover:bg-violet-500/[0.04]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 font-bold text-violet-300">
              {episode.number}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-zinc-100">
                  {episode.title}
                </h2>
                {episode.filler && (<span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
                  Filler
                </span>)}
                {episode.recap && (<span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                  Recapitulação
                </span>)}
              </div>
              {episode.titleRomanji &&
                episode.titleRomanji !==
                episode.title && (<p className="mt-1 truncate text-sm text-zinc-600">
                  {episode.titleRomanji}
                </p>)}
              {!isFallback && (<div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
                  {formatDate(episode.aired)}
                </div>
                {episode.score !== null && (<div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-yellow-400" />
                  {episode.score}
                </div>)}
              </div>)}
            </div>
          </div>
        </article>))}
      </div>)}
      {episodes.length > 0 && (<div className="mt-12 flex items-center justify-center gap-3">
        {currentPage > 1 && (<Link href={`/anime/${animeId}/episodes?page=${currentPage - 1}`} className="flex h-10 items-center gap-1 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 transition hover:border-violet-500 hover:text-white">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>)}
        <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-semibold">
          {currentPage}
        </div>
        {pagination.hasNextPage && (<Link href={`/anime/${animeId}/episodes?page=${currentPage + 1}`} className="flex h-10 items-center gap-1 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 transition hover:border-violet-500 hover:text-white">
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Link>)}
      </div>)}
      {episodes.length > 0 &&
        pagination.lastPage > 1 && (<p className="mt-4 text-center text-xs text-zinc-600">
          Página {currentPage} de{" "}
          {pagination.lastPage}
        </p>)}
    </section>
    <footer className="mt-10 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          AnimeHub — Projeto acadêmico
        </p>
        <p>
          {isFallback
            ? "Lista de episódios baseada em dados da AniList"
            : "Detalhes dos episódios fornecidos pelo Jikan / MyAnimeList"}
        </p>
      </div>
    </footer>
  </main>);
}
