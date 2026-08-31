"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAnimeStatus } from "../../lib/anime-status";
import { requireCurrentAppUser } from "../../lib/auth/current-user";
import { db } from "../../src/prisma/db";
export async function saveTracking(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const progress = Number(formData.get("progress"));
  const progressSeconds = Number(formData.get("progressSeconds"));
  const status = String(formData.get("status") || "");
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Item inválido.");
  }
  if (!Number.isInteger(progress) || progress < 0) {
    throw new Error("Progresso inválido.");
  }
  if (!Number.isInteger(progressSeconds) || progressSeconds < 0) {
    throw new Error("Minutagem inválida.");
  }
  if (!isAnimeStatus(status)) {
    throw new Error("Status inválido.");
  }
  const user = await requireCurrentAppUser();
  const item = await db.orm.public.UserAnime
    .where({ id: itemId, userId: user.id })
    .include("anime")
    .first();
  if (!item) {
    throw new Error("Item não encontrado.");
  }
  const anime = item.anime as unknown as {
    totalEpisodes: number | null;
  };
  const totalEpisodes = anime.totalEpisodes == null ? null : Number(anime.totalEpisodes);
  if (totalEpisodes !== null && progress > totalEpisodes) {
    throw new Error(`O progresso não pode ser maior que ${totalEpisodes}.`);
  }
  await db.orm.public.UserAnime
    .where({ id: item.id, userId: user.id })
    .update({ progress, progressSeconds, status });
  revalidatePath("/minha-lista");
  revalidatePath("/dashboard");
  redirect("/minha-lista?saved=1");
}
export async function removeAnimeFromList(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Item inválido.");
  }
  const user = await requireCurrentAppUser();
  const item = await db.orm.public.UserAnime
    .where({ id: itemId, userId: user.id })
    .first();
  if (!item) {
    throw new Error("Item não encontrado.");
  }
  await db.orm.public.UserAnime
    .where({ id: item.id, userId: user.id })
    .delete();
  revalidatePath("/minha-lista");
  revalidatePath("/dashboard");
  redirect("/minha-lista?removed=1");
}
