import SiteHeader from "../components/SiteHeader";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Search, Star } from "lucide-react";
import { getAnimeCatalog } from "../lib/anime-api";
type AnimeCatalogPageProps = {
  searchParams: Promise<{
    letter?: string;
    page?: string;
  }>;
};
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default async function AnimeCatalogPage({ searchParams }: AnimeCatalogPageProps) {
  const params = await searchParams;
  const selectedLetter = params.letter
    ?.trim()
    .toUpperCase() || "A";
  const currentPage = Math.max(1, Number(params.page) || 1);
  const result = await getAnimeCatalog(selectedLetter, currentPage);
  const { animes, pageInfo } = result;
  const currentLetterIndex = letters.indexOf(selectedLetter);
  const nextLetter = currentLetterIndex >= 0 &&
    currentLetterIndex <
    letters.length - 1
    ? letters[currentLetterIndex + 1]
    : null;
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader active="discover" />
    <section className="border-b border-white/5 bg-gradient-to-b from-violet-950/10 to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar para início
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
          Catálogo
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Animes com{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            {selectedLetter}
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Explore animes que começam com a letra{" "}
          <span className="font-semibold text-zinc-200">
            {selectedLetter}
          </span>
          .
        </p>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Letra {selectedLetter}
          </p>
          <h2 className="text-3xl font-bold tracking-tight">
            Animes com {selectedLetter}
          </h2>
          {currentPage > 1 && (<p className="mt-2 text-sm text-zinc-500">
            Página {currentPage}
          </p>)}
        </div>
        <Link href="/" className="text-sm text-zinc-500 transition hover:text-violet-400">
          Escolher outra letra na Home
        </Link>
      </div>
      {animes.length === 0 ? (<div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-zinc-600" />
        <h3 className="mt-5 text-2xl font-bold">
          Nenhum anime encontrado
        </h3>
        <p className="mt-2 text-zinc-500">
          Não encontramos mais animes com a letra{" "}
          {selectedLetter}.
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
      <div className="mt-16 flex justify-center">
        {pageInfo.hasNextPage ? (<Link href={`/animes?letter=${selectedLetter}&page=${currentPage + 1}`} className="group flex items-center gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 transition hover:border-violet-500/50 hover:bg-violet-500/15">
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-violet-400">
              Continuar
            </p>
            <p className="mt-1 font-semibold text-white">
              Próxima página
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-violet-400 transition group-hover:translate-x-1" />
        </Link>) : nextLetter ? (<Link href={`/animes?letter=${nextLetter}`} className="group flex min-w-[260px] items-center justify-between gap-8 rounded-2xl border border-violet-500/20 bg-violet-500/10 px-6 py-4 transition hover:border-violet-500/50 hover:bg-violet-500/15">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-violet-400">
              Próxima letra
            </p>
            <p className="mt-1 text-xl font-bold">
              {nextLetter}
            </p>
          </div>
          <ChevronRight className="h-6 w-6 text-violet-400 transition group-hover:translate-x-1" />
        </Link>) : (<Link href="/" className="group flex items-center gap-3 rounded-2xl border border-zinc-800 px-6 py-4 text-sm font-semibold text-zinc-300 transition hover:border-violet-500 hover:text-white">
          Voltar para início
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>)}
      </div>
    </section>
    <footer className="mt-14 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          AnimeHub — Projeto acadêmico
        </p>
        <p>
          Catálogo fornecido pela AniList
        </p>
      </div>
    </footer>
  </main>);
}
