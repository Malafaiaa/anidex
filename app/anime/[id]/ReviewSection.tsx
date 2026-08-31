import { BarChart3, MessageSquareText, Star, UserRound } from "lucide-react";
import { db } from "../../../src/prisma/db";
import { getCurrentAppUser } from "../../../lib/auth/current-user";
import ReviewForm from "./ReviewForm";
type ReviewSectionProps = {
  anilistId: number;
  title: string;
  imageUrl: string;
  totalEpisodes: number | null;
  saved: boolean;
};
type CommunityReview = {
  id: number;
  rating: number;
  comment: string | null;
  user: {
    id: number;
    name: string | null;
    username: string | null;
    email: string;
  };
};
type UserReview = {
  rating: number;
  comment: string | null;
};
function getDisplayName(review: CommunityReview) {
  if (review.user.name &&
    review.user.name.trim()) {
    return review.user.name;
  }
  if (review.user.username &&
    review.user.username.trim()) {
    return `@${review.user.username}`;
  }
  return "Usuário AnimeHub";
}
function getInitials(review: CommunityReview) {
  const name = getDisplayName(review).replace("@", "");
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return "AH";
  }
  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }
  return (parts[0][0] +
    parts[parts.length - 1][0]).toUpperCase();
}
export default async function ReviewSection({ anilistId, title, imageUrl, totalEpisodes, saved }: ReviewSectionProps) {
  const user = await getCurrentAppUser();
  const savedAnime = await db.orm.public.Anime
    .where({
      malId: anilistId
    })
    .first();
  let userReview: UserReview | null = null;
  let reviews: CommunityReview[] = [];
  if (savedAnime) {
    const rawReviews = await db.orm.public.Review
      .where({
        animeId: savedAnime.id
      })
      .include("user")
      .all();
    reviews =
      rawReviews as unknown as CommunityReview[];
    if (user) {
      const rawUserReview = await db.orm.public.Review
        .where({
          userId: user.id,
          animeId: savedAnime.id
        })
        .first();
      if (rawUserReview) {
        userReview = {
          rating: Number(rawUserReview.rating),
          comment: rawUserReview.comment
            ? String(rawUserReview.comment)
            : null
        };
      }
    }
  }
  const average = reviews.length > 0
    ? reviews.reduce((total, review) => total +
      Number(review.rating), 0) /
    reviews.length
    : null;
  const distribution = Array.from({
    length: 10
  }, (_, index) => {
    const rating = 10 - index;
    const count = reviews.filter((review) => Number(review.rating) === rating).length;
    const percentage = reviews.length > 0
      ? Math.round((count /
        reviews.length) *
        100)
      : 0;
    return {
      rating,
      count,
      percentage
    };
  });
  return (<section id="avaliacoes" className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-14">
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ReviewForm anilistId={anilistId} title={title} imageUrl={imageUrl} totalEpisodes={totalEpisodes} initialRating={userReview?.rating ??
        null} initialComment={userReview?.comment ??
          ""} saved={saved} />
      <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <BarChart3 className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-bold">
              Média da comunidade
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Avaliações do AnimeHub
            </p>
          </div>
        </div>
        <div className="my-5 h-px bg-white/10" />
        {average !== null ? (<>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">
              {average.toFixed(1)}
            </span>
            <span className="pb-1 text-sm text-zinc-600">
              /10
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <Star className="h-4 w-4 fill-violet-400 text-violet-400" />
            {reviews.length}{" "}
            {reviews.length === 1
              ? "avaliação"
              : "avaliações"}
          </div>
          <div className="mt-6 space-y-2.5">
            {distribution.map((item) => (<div key={item.rating} className="grid grid-cols-[22px_1fr_34px] items-center gap-2">
              <span className="text-xs text-zinc-500">
                {item.rating}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-violet-600" style={{
                  width: `${item.percentage}%`
                }} />
              </div>
              <span className="text-right text-[11px] text-zinc-700">
                {item.percentage}%
              </span>
            </div>))}
          </div>
        </>) : (<div className="py-8 text-center">
          <Star className="mx-auto h-7 w-7 text-zinc-700" />
          <p className="mt-3 text-sm font-medium text-zinc-400">
            Ainda sem avaliações
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">
            Sua avaliação pode ser a primeira.
          </p>
        </div>)}
      </aside>
    </div>
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
            <MessageSquareText className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Avaliações da comunidade
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Veja o que outros usuários acharam deste anime.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400">
          {reviews.length}{" "}
          {reviews.length === 1
            ? "avaliação"
            : "avaliações"}
        </span>
      </div>
      {reviews.length > 0 ? (<div className="mt-6 space-y-3">
        {reviews.map((review) => {
          const displayName = getDisplayName(review);
          const isCurrentUser = user &&
            Number(review.user.id) ===
            Number(user.id);
          return (<article key={review.id} className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-xs font-bold text-violet-300">
                  {getInitials(review)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-100">
                      {displayName}
                    </p>
                    {isCurrentUser && (<span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                      Você
                    </span>)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600">
                    <UserRound className="h-3.5 w-3.5" />
                    Usuário AnimeHub
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/[0.08] px-2.5 py-1.5 text-sm font-semibold text-violet-300">
                <Star className="h-3.5 w-3.5 fill-violet-400 text-violet-400" />
                {Number(review.rating)}/10
              </div>
            </div>
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              {review.comment &&
                review.comment.trim() ? (<p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                  {review.comment}
                </p>) : (<p className="text-sm italic text-zinc-600">
                  Este usuário não deixou um comentário.
                </p>)}
            </div>
          </article>);
        })}
      </div>) : (<div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
        <MessageSquareText className="mx-auto h-7 w-7 text-zinc-700" />
        <p className="mt-3 text-sm font-medium text-zinc-400">
          Nenhum comentário ainda
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-zinc-600">
          Quando alguém avaliar este anime, a nota e o comentário aparecerão aqui.
        </p>
      </div>)}
    </div>
  </section>);
}
