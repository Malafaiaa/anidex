import { getAnimeStatusClasses as getStatusClasses, getAnimeStatusLabel as getStatusLabel } from "../../lib/anime-status";
import SiteHeader from "../components/SiteHeader";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Eye, Film, ListVideo, Trash2 } from "lucide-react";
import { db } from "../../src/prisma/db";
import { requireCurrentAppUser } from "../../lib/auth/current-user";
import { removeAnimeFromList } from "./actions";
import TrackingControlsWithTime from "./TrackingControlsWithTime";
type MinhaListaPageProps = {
  searchParams: Promise<{
    status?: string;
    removed?: string;
    saved?: string;
  }>;
};
type AnimeListItem = {
  id: number;
  status: string;
  progress: number;
  progressSeconds: number;
  anime: {
    malId: number;
    title: string;
    imageUrl: string | null;
    totalEpisodes: number | null;
  };
};
const statusOptions = [
  {
    value: "ALL",
    label: "Todos"
  },
  {
    value: "WATCHING",
    label: "Assistindo"
  },
  {
    value: "WANT_TO_WATCH",
    label: "Quero assistir"
  },
  {
    value: "COMPLETED",
    label: "Concluídos"
  },
  {
    value: "PAUSED",
    label: "Pausados"
  },
  {
    value: "DROPPED",
    label: "Abandonados"
  },
];
export default async function MinhaListaPage({ searchParams }: MinhaListaPageProps) {
  const params = await searchParams;
  const selectedStatus = statusOptions.some((option) => option.value ===
    params.status)
    ? params.status!
    : "ALL";
  const user = await requireCurrentAppUser();
  const allItems = (user
    ? await db.orm.public.UserAnime
      .where({
        userId: user.id
      })
      .include("anime")
      .all()
    : []) as unknown as AnimeListItem[];
  const items = selectedStatus === "ALL"
    ? allItems
    : allItems.filter((item) => item.status ===
      selectedStatus);
  const counts = statusOptions.reduce((accumulator, option) => {
    accumulator[option.value] =
      option.value === "ALL"
        ? allItems.length
        : allItems.filter((item) => item.status ===
          option.value).length;
    return accumulator;
  }, {} as Record<string, number>);
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader active="list" backHref="/" />
    <section className="border-b border-white/5 bg-gradient-to-b from-violet-950/10 to-transparent">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
          <ListVideo className="h-4 w-4" />
          Biblioteca pessoal
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
          Minha Lista
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
          Organize seus animes e acompanhe quantos episódios você já assistiu.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Total
            </p>
            <p className="mt-1 text-xl font-bold">
              {allItems.length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Assistindo
            </p>
            <p className="mt-1 text-xl font-bold">
              {counts.WATCHING}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Concluídos
            </p>
            <p className="mt-1 text-xl font-bold">
              {counts.COMPLETED}
            </p>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-12">
      {params.saved === "1" && (<div className="mb-6 flex max-w-xl items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Progresso e status salvos com sucesso.
      </div>)}
      {params.removed === "1" && (<div className="mb-6 flex max-w-xl items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
        Anime removido da sua lista.
      </div>)}
      <div className="mb-10 flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const active = selectedStatus ===
            option.value;
          const href = option.value ===
            "ALL"
            ? "/minha-lista"
            : `/minha-lista?status=${option.value}`;
          return (<Link key={option.value} href={href} className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${active
            ? "border-violet-500 bg-violet-600 text-white"
            : "border-zinc-800 bg-white/[0.02] text-zinc-400 hover:border-violet-500/50 hover:text-white"}`}>
            {option.label}
            <span className="ml-2 text-xs opacity-60">
              {counts[option.value]}
            </span>
          </Link>);
        })}
      </div>
      {items.length === 0 ? (<div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
          <Film className="h-6 w-6 text-violet-400" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">
          Nenhum anime aqui ainda
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-500">
          Adicione animes pelo catálogo e eles aparecerão nesta página.
        </p>
        <Link href="/" className="mt-7 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500">
          Descobrir animes
        </Link>
      </div>) : (<div className="space-y-5">
        {items.map((item) => {
          const anime = item.anime;
          const totalEpisodes = anime.totalEpisodes !== null &&
            anime.totalEpisodes !== undefined
            ? Number(anime.totalEpisodes)
            : null;
          const currentProgress = Number(item.progress);
          const currentProgressSeconds = Number(item.progressSeconds);
          const progressMinutes = Math.floor(currentProgressSeconds /
            60);
          const progressRemainingSeconds = currentProgressSeconds %
            60;
          const progressTimeLabel = `${String(progressMinutes).padStart(2, "0")}:${String(progressRemainingSeconds).padStart(2, "0")}`;
          const progressPercent = totalEpisodes !== null &&
            totalEpisodes > 0
            ? Math.min(100, Math.max(0, (currentProgress /
              totalEpisodes) *
              100))
            : 0;
          return (<article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition hover:border-violet-500/25">
            <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start">
              <Link href={`/anime/${anime.malId}`} className="relative aspect-[2/3] w-[140px] shrink-0 self-start overflow-hidden rounded-2xl bg-zinc-900 sm:w-[160px] lg:w-[200px]">
                {anime.imageUrl ? (<Image src={anime.imageUrl} alt={anime.title} fill className="object-cover transition duration-500 hover:scale-105" sizes="(min-width: 1024px) 200px, (min-width: 640px) 160px, 140px" />) : (<div className="flex h-full items-center justify-center text-zinc-700">
                  <Film className="h-6 w-6" />
                </div>)}
              </Link>
              <div className="min-w-0 flex-1 py-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold leading-tight">
                    {anime.title}
                  </h2>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <div className="mt-5 max-w-xl">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                        Progresso
                      </p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {currentProgress}
                        {totalEpisodes !== null
                          ? ` / ${totalEpisodes}`
                          : ""}{" "}
                        episódios
                      </p>
                      {currentProgressSeconds > 0 && (<p className="mt-1 text-xs text-violet-400">
                        Parou em {progressTimeLabel}
                      </p>)}
                    </div>
                    {totalEpisodes !== null &&
                      totalEpisodes > 0 && (<span className="text-xs text-zinc-600">
                        {Math.round(progressPercent)}
                        %
                      </span>)}
                  </div>
                  {totalEpisodes !== null &&
                    totalEpisodes > 0 && (<div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-violet-600 transition-all" style={{
                        width: `${progressPercent}%`
                      }} />
                    </div>)}
                </div>
                <Link href={`/anime/${anime.malId}`} className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition hover:text-violet-300">
                  <Eye className="h-4 w-4" />
                  Ver detalhes
                </Link>
              </div>
              <div className="w-full shrink-0 border-t border-white/10 pt-4 lg:w-[340px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <TrackingControlsWithTime key={`${item.id}-${item.status}-${currentProgress}-${currentProgressSeconds}`} itemId={item.id} currentProgress={currentProgress} currentProgressSeconds={currentProgressSeconds} totalEpisodes={totalEpisodes} currentStatus={item.status} />
                <form action={removeAnimeFromList} className="mt-3 border-t border-white/10 pt-3">
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 text-sm font-medium text-red-300 transition hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                    Remover da lista
                  </button>
                </form>
              </div>
            </div>
          </article>);
        })}
      </div>)}
    </section>
    <footer className="mt-12 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <p>
          AnimeHub — Projeto acadêmico
        </p>
        <p>
          Minha Lista · Progresso · Prisma · Neon
        </p>
      </div>
    </footer>
  </main>);
}
