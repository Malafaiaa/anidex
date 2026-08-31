import SiteHeader from "./components/SiteHeader";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Sparkles, ListPlus, BarChart3, ChevronLeft, ChevronRight, Play, TrendingUp, ArrowRight } from "lucide-react";
import { getTopAnime, searchAnime } from "../app/lib/anime-api";
type HomeProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};
const catalogLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  const currentPage = Math.max(1, Number(params.page) || 1);
  let animes;
  let pageInfo = {
    currentPage: 1,
    hasNextPage: false
  };
  if (query) {
    const result = await searchAnime(query, currentPage);
    animes = result.animes;
    pageInfo = result.pageInfo;
  }
  else {
    animes = await getTopAnime();
  }
  const startPage = Math.max(1, currentPage - 2);
  const pages = Array.from({
    length: currentPage - startPage + 1
  }, (_, index) => startPage + index);
  const featuredAnime = !query && animes.length > 0
    ? animes[0]
    : null;
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader active="discover" />
    {!query && (<section className="relative overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute left-[20%] top-0 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-[10%] top-[10%] h-[400px] w-[400px] rounded-full bg-fuchsia-600/[0.06] blur-[130px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles className="h-4 w-4" />
            Seu universo de anime
          </div>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[58px]">
            Descubra seu próximo
            <span className="mt-1 block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              anime favorito
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Explore animes, acompanhe seus
            episódios e organize tudo que
            você está assistindo em um só lugar.
          </p>
          <form action="/" method="GET" className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] p-2 shadow-2xl shadow-black/30 backdrop-blur">
            <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-500" />
            <input type="text" name="q" placeholder="Pesquise Naruto, One Piece, Bleach..." className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" />
            <button type="submit" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500">
              Buscar
            </button>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-violet-400" />
              Pesquise
            </div>
            <div className="flex items-center gap-2">
              <ListPlus className="h-4 w-4 text-violet-400" />
              Monte sua lista
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              Estatísticas
            </div>
          </div>
        </div>
        {featuredAnime && (<div className="relative hidden justify-center lg:flex">
          <div className="absolute inset-0 m-auto h-[330px] w-[330px] rounded-full bg-violet-600/20 blur-[100px]" />
          <Link href={`/anime/${featuredAnime.mal_id}`} className="group relative block w-full max-w-[380px]">
            <div className="relative aspect-[16/11] overflow-hidden rounded-[28px] border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
              <Image src={featuredAnime.images.jpg
                .large_image_url} alt={featuredAnime.title} fill priority className="object-cover transition duration-700 group-hover:scale-105" sizes="380px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
                Em destaque
              </div>
              {featuredAnime.score && (<div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {featuredAnime.score}
              </div>)}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                  Anime em alta
                </p>
                <h2 className="line-clamp-2 text-2xl font-bold leading-tight">
                  {featuredAnime.title}
                </h2>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    {featuredAnime.episodes
                      ? `${featuredAnime.episodes} episódios`
                      : featuredAnime.status}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 transition group-hover:scale-110 group-hover:bg-violet-500">
                    <Play className="ml-0.5 h-4 w-4 fill-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>)}
      </div>
    </section>)}
    <section className="mx-auto max-w-7xl px-6 py-12">
      {query && (<form action="/" method="GET" className="mb-12 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-xl backdrop-blur">
        <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-500" />
        <input type="text" name="q" defaultValue={query} placeholder="Pesquise por Naruto, One Piece, Bleach..." className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600" />
        <button type="submit" className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500">
          Buscar
        </button>
      </form>)}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            {query
              ? "Pesquisa"
              : "Populares"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            {query
              ? `Resultados para "${query}"`
              : "Animes em alta"}
          </h2>
          {query && (<p className="mt-2 text-sm text-zinc-500">
            Página {currentPage}
          </p>)}
        </div>
        {!query && (<div className="hidden items-center gap-2 text-sm text-zinc-500 sm:flex">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          Mais populares agora
        </div>)}
      </div>
      {animes.length === 0 ? (<div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-zinc-600" />
        <h3 className="mt-5 text-xl font-semibold">
          Nenhum anime encontrado
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          Tente pesquisar outro título.
        </p>
      </div>) : (<div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {animes.map((anime) => (<article key={anime.mal_id} className="group">
          <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 shadow-xl shadow-black/20">
            <Image src={anime.images.jpg
              .large_image_url} alt={anime.title} fill className="object-cover transition duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, 16vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition group-hover:opacity-100" />
            {anime.score && (<div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/80 px-2.5 py-1.5 text-xs font-semibold backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {anime.score}
            </div>)}
            <div className="absolute inset-x-0 bottom-0 translate-y-3 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Link href={`/anime/${anime.mal_id}`} className="block w-full rounded-lg bg-violet-600 py-2 text-center text-xs font-semibold transition hover:bg-violet-500">
                Ver detalhes
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="line-clamp-2 min-h-[48px] font-semibold leading-6 text-zinc-100 transition group-hover:text-violet-400">
              {anime.title}
            </h3>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-zinc-500">
              <span>
                {anime.episodes
                  ? `${anime.episodes} episódios`
                  : "Em andamento"}
              </span>
              <span className="text-right">
                {anime.status}
              </span>
            </div>
          </div>
        </article>))}
      </div>)}
      {query &&
        animes.length > 0 && (<div className="mt-14 flex flex-wrap items-center justify-center gap-2">
          {currentPage > 1 && (<a href={`/?q=${encodeURIComponent(query)}&page=${currentPage - 1}`} className="flex h-10 items-center gap-1 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 transition hover:border-violet-500 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </a>)}
          {pages.map((page) => (<a key={page} href={`/?q=${encodeURIComponent(query)}&page=${page}`} className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${currentPage === page
            ? "bg-violet-600 text-white shadow-lg shadow-violet-950"
            : "border border-zinc-800 text-zinc-400 hover:border-violet-500 hover:text-white"}`}>
            {page}
          </a>))}
          {pageInfo.hasNextPage && (<a href={`/?q=${encodeURIComponent(query)}&page=${currentPage + 1}`} className="flex h-10 items-center gap-1 rounded-xl border border-zinc-800 px-4 text-sm text-zinc-400 transition hover:border-violet-500 hover:text-white">
            Próxima
            <ChevronRight className="h-4 w-4" />
          </a>)}
        </div>)}
    </section>
    {!query && (<section className="border-t border-white/5 bg-gradient-to-b from-violet-950/[0.10] to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Explore o catálogo
            </p>
            <h2 className="max-w-lg text-3xl font-black tracking-tight sm:text-4xl">
              Encontre animes de
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {" "}A até Z
              </span>
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-zinc-400">
              Navegue pelo catálogo em ordem alfabética e descubra títulos novos para assistir.
            </p>
            <Link href="/animes" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500">
              Explorar catálogo completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-200">
                  Escolha uma letra
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Veja títulos que começam com ela.
                </p>
              </div>
              <Link href="/animes" className="hidden text-sm font-medium text-violet-400 transition hover:text-violet-300 sm:block">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-7 gap-2 sm:grid-cols-9 md:grid-cols-13 lg:grid-cols-7 xl:grid-cols-9">
              {catalogLetters.map((letter) => (<Link key={letter} href={`/animes?letter=${letter}`} className="flex aspect-square items-center justify-center rounded-xl border border-zinc-800 bg-black/20 text-sm font-semibold text-zinc-400 transition hover:border-violet-500/70 hover:bg-violet-500/10 hover:text-violet-300">
                {letter}
              </Link>))}
            </div>
          </div>
        </div>
      </div>
    </section>)}
    <footer className="mt-12 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          AniDex — Projeto IMPACTA
        </p>
        <p>
          Next.js · Prisma · Neon · Tailwind CSS
        </p>
      </div>
    </footer>
  </main>);
}
