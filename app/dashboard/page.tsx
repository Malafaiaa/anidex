import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Film,
  ListVideo,
  PlayCircle,
  Star,
  Tag,
  Tv2,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader";
import { requireCurrentAppUser } from "../../lib/auth/current-user";
import { db } from "../../src/prisma/db";
import { getAnimeGenresByIds } from "./dashboard-anime-api";

type DashboardListItem = {
  id: number;
  status: string;
  progress: number;
  progressSeconds: number;
  updatedAt?: string | null;
  anime: {
    id: number;
    malId: number;
    title: string;
    imageUrl: string | null;
    totalEpisodes: number | null;
  };
};

type DashboardReview = {
  id: number;
  rating: number;
  comment: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  anime: {
    id: number;
    malId: number;
    title: string;
    imageUrl: string | null;
  };
};

const statusConfig = [
  {
    key: "WATCHING",
    label: "Assistindo",
    dotClass: "bg-violet-500",
    gradientColor: "#8b5cf6",
  },
  {
    key: "WANT_TO_WATCH",
    label: "Quero assistir",
    dotClass: "bg-blue-500",
    gradientColor: "#3b82f6",
  },
  {
    key: "COMPLETED",
    label: "Concluídos",
    dotClass: "bg-emerald-500",
    gradientColor: "#10b981",
  },
  {
    key: "PAUSED",
    label: "Pausados",
    dotClass: "bg-amber-500",
    gradientColor: "#f59e0b",
  },
  {
    key: "DROPPED",
    label: "Abandonados",
    dotClass: "bg-rose-500",
    gradientColor: "#f43f5e",
  },
] as const;

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 sm:h-11 sm:w-11">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-4 text-zinc-500 sm:text-sm">{label}</p>
          <p className="mt-1 break-words text-xl font-black tracking-tight text-white sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="font-bold leading-5 text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-zinc-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function getPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function getProgressPercent(current: number, total: number | null) {
  if (total === null || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

function getDateValue(value?: string | null) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export default async function DashboardPage() {
  const user = await requireCurrentAppUser();

  const listItems = (await db.orm.public.UserAnime.where({
    userId: user.id,
  })
    .include("anime")
    .all()) as unknown as DashboardListItem[];

  const reviews = (await db.orm.public.Review.where({
    userId: user.id,
  })
    .include("anime")
    .all()) as unknown as DashboardReview[];

  let genreMap: Record<number, string[]> = {};
  let genresAvailable = true;

  try {
    genreMap = await getAnimeGenresByIds(
      listItems.map((item) => Number(item.anime.malId)),
    );
  } catch (error) {
    console.error("Dashboard: não foi possível carregar os gêneros:", error);
    genresAvailable = false;
  }

  const genreCounts = new Map<string, number>();

  for (const item of listItems) {
    const genres = genreMap[Number(item.anime.malId)] || [];

    for (const genre of new Set(genres)) {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    }
  }

  const total = listItems.length;

  if (total > 0 && genreCounts.size === 0) {
    genresAvailable = false;
  }

  const topGenres = Array.from(genreCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percent: getPercent(count, total),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  const counts = statusConfig.reduce(
    (result, status) => {
      result[status.key] = listItems.filter(
        (item) => item.status === status.key,
      ).length;
      return result;
    },
    {} as Record<string, number>,
  );

  const statusData = statusConfig.map((status) => ({
    ...status,
    value: counts[status.key] || 0,
    percent: getPercent(counts[status.key] || 0, total),
  }));

  const episodesSeen = listItems.reduce(
    (sum, item) => sum + Math.max(0, Number(item.progress) || 0),
    0,
  );

  const registeredPositionSeconds = listItems.reduce(
    (sum, item) => sum + Math.max(0, Number(item.progressSeconds) || 0),
    0,
  );

  const registeredMinutes = Math.floor(registeredPositionSeconds / 60);

  const progressItems = listItems
    .filter((item) => item.status === "WATCHING")
    .sort((a, b) => getDateValue(b.updatedAt) - getDateValue(a.updatedAt))
    .slice(0, 4);

  const latestReviews = [...reviews]
    .sort(
      (a, b) =>
        getDateValue(b.updatedAt || b.createdAt) -
        getDateValue(a.updatedAt || a.createdAt),
    )
    .slice(0, 3);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : "—";

  const conicStops: string[] = [];
  let currentPercent = 0;

  for (const item of statusData) {
    const start = currentPercent;
    const end = currentPercent + item.percent;

    if (item.value > 0) {
      conicStops.push(`${item.gradientColor} ${start}% ${end}%`);
    }

    currentPercent = end;
  }

  const donutBackground =
    total > 0 && conicStops.length > 0
      ? `conic-gradient(${conicStops.join(",")})`
      : "conic-gradient(#27272a 0 100%)";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#09090b] text-white">
      <SiteHeader active="dashboard" wide />

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 sm:py-10">
        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-400 sm:text-sm sm:tracking-[0.18em]">
            <BarChart3 className="h-4 w-4" />
            Visão geral
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Acompanhe seu progresso, avaliações e gêneros favoritos.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<ListVideo className="h-5 w-5" />}
            label="Total na lista"
            value={total}
          />
          <StatCard
            icon={<PlayCircle className="h-5 w-5" />}
            label="Assistindo"
            value={counts.WATCHING || 0}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Concluídos"
            value={counts.COMPLETED || 0}
          />
          <StatCard
            icon={<Star className="h-5 w-5" />}
            label="Avaliações"
            value={reviews.length}
          />
          <StatCard
            icon={<Tv2 className="h-5 w-5" />}
            label="Episódios vistos"
            value={episodesSeen}
          />
          <StatCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Minutos marcados"
            value={registeredMinutes > 0 ? `${registeredMinutes} min` : "0 min"}
          />
        </section>

        <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
            <SectionTitle
              icon={<BarChart3 className="h-4 w-4" />}
              title="Status da sua lista"
              subtitle="Distribuição dos seus animes"
            />

            <div className="mt-6 grid gap-6 sm:mt-7 md:grid-cols-[190px_1fr] md:items-center md:gap-8">
              <div
                className="relative mx-auto h-40 w-40 rounded-full shadow-[0_0_50px_rgba(124,58,237,0.14)] sm:h-[180px] sm:w-[180px] md:h-[190px] md:w-[190px]"
                style={{ background: donutBackground }}
              >
                <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full border border-white/5 bg-[#0d0d10] sm:inset-[27px] md:inset-7">
                  <span className="text-3xl font-black sm:text-4xl">{total}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600 sm:text-xs">
                    Total
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {statusData.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotClass}`}
                      />
                      <span className="truncate text-sm text-zinc-300">
                        {item.label}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-500 sm:text-sm">
                      {item.value} ({item.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
            <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
              <SectionTitle
                icon={<PlayCircle className="h-4 w-4" />}
                title="Progresso geral"
                subtitle="Animes que você está acompanhando"
              />
              <Link
                href="/minha-lista"
                className="shrink-0 self-start text-xs font-medium text-violet-400 transition hover:text-violet-300 sm:text-sm"
              >
                Ver todos
              </Link>
            </div>

            {progressItems.length > 0 ? (
              <div className="mt-6 space-y-5 sm:mt-7">
                {progressItems.map((item) => {
                  const totalEpisodes =
                    item.anime.totalEpisodes !== null
                      ? Number(item.anime.totalEpisodes)
                      : null;
                  const current = Number(item.progress) || 0;
                  const percent = getProgressPercent(current, totalEpisodes);

                  return (
                    <div key={item.id} className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/anime/${item.anime.malId}`}
                            className="block truncate text-sm font-semibold text-zinc-100 transition hover:text-violet-300"
                          >
                            {item.anime.title}
                          </Link>
                          <p className="mt-1 text-xs text-zinc-600">
                            {current}
                            {totalEpisodes !== null ? ` / ${totalEpisodes}` : ""} episódios
                          </p>
                        </div>
                        <span className="shrink-0 pt-0.5 text-xs font-medium text-zinc-500">
                          {percent}%
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-violet-600 transition-[width] duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-4 py-9 text-center sm:mt-7 sm:px-6 sm:py-12">
                <PlayCircle className="mx-auto h-7 w-7 text-zinc-700" />
                <p className="mt-3 text-sm font-medium text-zinc-400">
                  Nenhum anime em andamento
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Animes com status Assistindo aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
            <SectionTitle
              icon={<Tag className="h-4 w-4" />}
              title="Gêneros mais presentes"
              subtitle={
                total > 0
                  ? `Baseado em ${total} ${total === 1 ? "anime" : "animes"} da sua lista`
                  : "Categorias da sua lista"
              }
            />

            {topGenres.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
                {topGenres.map((genre) => (
                  <div
                    key={genre.name}
                    className="max-w-full rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 sm:px-3.5 sm:py-2 sm:text-sm"
                  >
                    <span className="font-medium">{genre.name}</span>
                    <span className="ml-1.5 text-[10px] text-violet-400/70 sm:ml-2 sm:text-xs">
                      {genre.count} ({genre.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center sm:mt-6 sm:px-5 sm:py-9">
                <Tag className="mx-auto h-6 w-6 text-zinc-700" />
                <p className="mt-3 text-sm font-medium text-zinc-400">
                  {total > 0 && !genresAvailable
                    ? "Gêneros indisponíveis no momento."
                    : "Sua lista ainda está vazia."}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                  {total > 0 && !genresAvailable
                    ? "A AniList não respondeu, mas o restante do Dashboard continua funcionando normalmente."
                    : "Adicione animes para descobrir quais gêneros aparecem mais na sua lista."}
                </p>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
            <SectionTitle
              icon={<Star className="h-4 w-4" />}
              title="Últimas avaliações"
              subtitle={`Sua média: ${averageRating}/10`}
            />

            {latestReviews.length > 0 ? (
              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
                {latestReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/anime/${review.anime.malId}`}
                    className="block min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3.5 transition hover:border-violet-500/25 sm:p-4"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
                      <p className="min-w-0 truncate text-sm font-semibold">
                        {review.anime.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-violet-300 sm:text-sm">
                        <Star className="h-3.5 w-3.5 fill-violet-400 text-violet-400" />
                        {review.rating}/10
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                      {review.comment?.trim() ? review.comment : "Sem comentário."}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-9 text-center sm:mt-6 sm:px-5 sm:py-10">
                <Star className="mx-auto h-6 w-6 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">
                  Você ainda não avaliou nenhum anime.
                </p>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:rounded-3xl sm:p-6">
            <SectionTitle
              icon={<Film className="h-4 w-4" />}
              title="Continue assistindo"
              subtitle="Retome de onde parou"
            />

            {progressItems.length > 0 ? (
              <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-5">
                {progressItems.slice(0, 3).map((item) => {
                  const totalEpisodes =
                    item.anime.totalEpisodes !== null
                      ? Number(item.anime.totalEpisodes)
                      : null;
                  const current = Number(item.progress) || 0;
                  const percent = getProgressPercent(current, totalEpisodes);

                  return (
                    <Link
                      key={item.id}
                      href={`/anime/${item.anime.malId}`}
                      className="block min-w-0 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3.5 transition hover:border-violet-500/25 sm:p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.anime.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            Episódio {current}
                            {totalEpisodes !== null ? ` de ${totalEpisodes}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-zinc-500">
                          {percent}%
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-violet-600"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-4 py-9 text-center sm:mt-6 sm:px-5 sm:py-10">
                <Film className="mx-auto h-6 w-6 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">
                  Nada para continuar por enquanto.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
