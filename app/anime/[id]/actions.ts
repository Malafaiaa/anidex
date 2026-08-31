"use server";
import { isAnimeStatus } from "../../../lib/anime-status";
import { revalidatePath } from "next/cache";
import { db } from "../../../src/prisma/db";
import { requireCurrentAppUser } from "../../../lib/auth/current-user";
function readAnimeFormData(formData: FormData) {
  const anilistId = Number(formData.get("anilistId"));
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const totalEpisodesRaw = String(formData.get("totalEpisodes") || "").trim();
  const totalEpisodes = totalEpisodesRaw === ""
    ? null
    : Number(totalEpisodesRaw);
  if (!Number.isInteger(anilistId) ||
    anilistId <= 0 ||
    !title) {
    throw new Error("Dados do anime inválidos.");
  }
  return {
    anilistId,
    title,
    imageUrl,
    totalEpisodes: totalEpisodes !== null &&
      Number.isFinite(totalEpisodes)
      ? totalEpisodes
      : null
  };
}
async function getOrCreateAnime(animeData: {
  anilistId: number;
  title: string;
  imageUrl: string;
  totalEpisodes: number | null;
}) {
  let anime = await db.orm.public.Anime
    .where({
      malId: animeData.anilistId
    })
    .first();
  if (anime) {
    const updated = await db.orm.public.Anime
      .where({
        id: Number(anime.id)
      })
      .update({
        title: animeData.title,
        imageUrl: animeData.imageUrl ||
          null,
        totalEpisodes: animeData.totalEpisodes
      });
    if (updated) {
      anime =
        updated;
    }
  }
  else {
    anime =
      await db.orm.public.Anime.create({
        malId: animeData.anilistId,
        title: animeData.title,
        imageUrl: animeData.imageUrl ||
          null,
        totalEpisodes: animeData.totalEpisodes
      });
  }
  return anime;
}
export async function addAnimeToList(formData: FormData) {
  const animeData = readAnimeFormData(formData);
  const requestedStatus = String(formData.get("status") ||
    "WANT_TO_WATCH");
  const status = isAnimeStatus(requestedStatus)
    ? requestedStatus
    : "WANT_TO_WATCH";
  const user = await requireCurrentAppUser();
  const anime = await getOrCreateAnime(animeData);
  const userId = Number(user.id);
  const animeId = Number(anime.id);
  const existing = await db.orm.public.UserAnime
    .where({
      userId,
      animeId
    })
    .first();
  if (existing) {
    await db.orm.public.UserAnime
      .where({
        id: Number(existing.id),
        userId
      })
      .update({
        status
      });
  }
  else {
    await db.orm.public.UserAnime.create({
      status,
      progress: 0,
      progressSeconds: 0,
      userId,
      animeId
    });
  }
  revalidatePath(`/anime/${animeData.anilistId}`);
  revalidatePath("/minha-lista");
  return {
    success: true,
    message: "Anime salvo na sua lista."
  };
}
export async function saveReview(formData: FormData) {
  const animeData = readAnimeFormData(formData);
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "")
    .trim()
    .slice(0, 1000);
  if (!Number.isInteger(rating) ||
    rating < 1 ||
    rating > 10) {
    throw new Error("A nota deve estar entre 1 e 10.");
  }
  const user = await requireCurrentAppUser();
  const anime = await getOrCreateAnime(animeData);
  const userId = Number(user.id);
  const animeId = Number(anime.id);
  const existingReview = await db.orm.public.Review
    .where({
      userId,
      animeId
    })
    .first();
  if (existingReview) {
    await db.orm.public.Review
      .where({
        id: Number(existingReview.id),
        userId
      })
      .update({
        rating,
        comment: comment || null
      });
  }
  else {
    await db.orm.public.Review.create({
      rating,
      comment: comment || null,
      userId,
      animeId
    });
  }
  revalidatePath(`/anime/${animeData.anilistId}`);
  return {
    success: true,
    message: "Avaliação salva com sucesso."
  };
}
export async function deleteReview(formData: FormData) {
  const anilistId = Number(formData.get("anilistId"));
  if (!Number.isInteger(anilistId) ||
    anilistId <= 0) {
    throw new Error("Anime inválido.");
  }
  const user = await requireCurrentAppUser();
  const anime = await db.orm.public.Anime
    .where({
      malId: anilistId
    })
    .first();
  if (!anime) {
    return {
      success: true,
      message: "Avaliação já estava removida."
    };
  }
  const userId = Number(user.id);
  const animeId = Number(anime.id);
  const review = await db.orm.public.Review
    .where({
      userId,
      animeId
    })
    .first();
  if (review) {
    await db.orm.public.Review
      .where({
        id: Number(review.id),
        userId
      })
      .delete();
  }
  revalidatePath(`/anime/${anilistId}`);
  revalidatePath("/dashboard");
  return {
    success: true,
    message: "Avaliação excluída com sucesso."
  };
}
