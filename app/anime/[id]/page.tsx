import SiteHeader from "../../components/SiteHeader";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, ChevronRight, Clock, ListPlus, PlayCircle, Star, Tags } from "lucide-react";
import { getAnimeById } from "../../lib/anime-api";
import AddToListForm from "./AddToListForm";
import ReviewSection from "./ReviewSection";
type AnimePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    list?: string;
    review?: string;
  }>;
};
function formatAnimeFormat(format: string | null) {
  switch (format) {
    case "TV":
      return "Série de TV";
    case "MOVIE":
      return "Filme";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "SPECIAL":
      return "Especial";
    case "TV_SHORT":
      return "Série curta";
    case "MUSIC":
      return "Música";
    default:
      return format || "Não informado";
  }
}
export default async function AnimePage({ params, searchParams }: AnimePageProps) {
  const { id } = await params;
  await searchParams;
  const animeId = Number(id);
  if (Number.isNaN(animeId) ||
    animeId <= 0) {
    return (<main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Anime inválido
        </h1>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">
          Voltar
        </Link>
      </div>
    </main>);
  }
  const anime = await getAnimeById(animeId);
  if (!anime) {
    return (<main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Anime não encontrado
        </h1>
        <p className="mt-3 text-zinc-500">
          Não foi possível encontrar esse anime.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500">
          Voltar para o catálogo
        </Link>
      </div>
    </main>);
  }
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader showNav={false} backHref="/" />
    <section className="relative overflow-hidden border-b border-white/5">
      {anime.bannerImage && (<>
        <Image src={anime.bannerImage} alt={anime.title} fill priority className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#09090b]/70 to-[#09090b]" />
      </>)}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[280px_1fr] md:py-20">
        <div>
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
            <Image src={anime.images.jpg
              .large_image_url} alt={anime.title} fill priority className="object-cover" sizes="280px" />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Detalhes do anime
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            {anime.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {anime.score !== null && (<div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {anime.score}
              </span>
            </div>)}
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
              {anime.status}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
              {formatAnimeFormat(anime.format)}
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {anime.malId ? (<Link href={`/anime/${anime.mal_id}/episodes`} className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-500/[0.07]">
              <div className="flex items-start justify-between">
                <PlayCircle className="mb-3 h-5 w-5 text-violet-400" />
                <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-violet-400" />
              </div>
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Episódios
              </p>
              <p className="mt-1 font-semibold">
                {anime.episodes ??
                  "Não informado"}
              </p>
              <p className="mt-3 text-xs font-medium text-violet-400 opacity-70 transition group-hover:opacity-100">
                Ver todos →
              </p>
            </Link>) : (<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <PlayCircle className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Episódios
              </p>
              <p className="mt-1 font-semibold">
                {anime.episodes ??
                  "Não informado"}
              </p>
            </div>)}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <CalendarDays className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Ano
              </p>
              <p className="mt-1 font-semibold">
                {anime.year ??
                  "Não informado"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Clock className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Duração
              </p>
              <p className="mt-1 font-semibold">
                {anime.duration
                  ? `${anime.duration} min`
                  : "Não informado"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Star className="mb-3 h-5 w-5 text-violet-400" />
              <p className="text-xs uppercase tracking-wider text-zinc-600">
                Nota
              </p>
              <p className="mt-1 font-semibold">
                {anime.score ??
                  "Sem avaliação"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto grid max-w-7xl items-start gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <BookOpen className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Sinopse
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Conheça a história deste anime
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-violet-500/30 via-white/5 to-transparent" />
        <p className="mt-6 whitespace-pre-line text-[15px] leading-8 text-zinc-400 md:text-base">
          {anime.description}
        </p>
      </div>
      <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <Tags className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              Gêneros
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Categorias do anime
            </p>
          </div>
        </div>
        <div className="my-5 h-px bg-white/10" />
        <div className="flex flex-wrap gap-2">
          {anime.genres.length > 0 ? (anime.genres.map((genre) => (<span key={genre} className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-300">
            {genre}
          </span>))) : (<p className="text-sm text-zinc-500">
            Nenhum gênero informado.
          </p>)}
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <ListPlus className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold">
                Minha Lista
              </p>
              <p className="text-xs text-zinc-600">
                Salve este anime para acompanhar depois.
              </p>
            </div>
          </div>
          <AddToListForm anilistId={anime.mal_id} title={anime.title} imageUrl={anime.images.jpg.large_image_url} totalEpisodes={anime.episodes ?? null} />
        </div>
      </aside>
    </section>
    <ReviewSection anilistId={anime.mal_id} title={anime.title} imageUrl={anime.images.jpg
      .large_image_url} totalEpisodes={anime.episodes ??
        null} saved={false} />
    <footer className="mt-10 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          AnimeHub — Projeto acadêmico
        </p>
        <p>
          Dados fornecidos por AniList, Anivex e Jikan
        </p>
      </div>
    </footer>
  </main>);
}
