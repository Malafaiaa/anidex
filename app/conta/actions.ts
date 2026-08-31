"use server";
import { revalidatePath } from "next/cache";
import { auth } from "../../lib/auth/server";
import { getCurrentAuthUser, requireCurrentAppUser } from "../../lib/auth/current-user";
import { db } from "../../src/prisma/db";
type SignInResult = {
  error?: {
    message?: string;
  } | null;
};
export async function deleteAccount(formData: FormData) {
  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "").trim().toUpperCase();
  if (confirmation !== "EXCLUIR") {
    return { success: false, message: 'Digite "EXCLUIR" para confirmar.' };
  }
  if (!password) {
    return { success: false, message: "Digite sua senha para excluir a conta." };
  }
  const authUser = await getCurrentAuthUser();
  if (!authUser?.id || !authUser.email) {
    return {
      success: false,
      message: "Sua sessão não foi encontrada. Entre novamente e tente de novo."
    };
  }
  const appUser = await requireCurrentAppUser();
  let signInResult: SignInResult;
  try {
    signInResult = (await auth.signIn.email({
      email: authUser.email,
      password
    })) as SignInResult;
  }
  catch (error) {
    console.error("Erro ao confirmar senha antes da exclusão:", error);
    return { success: false, message: "Não foi possível confirmar sua senha." };
  }
  if (signInResult?.error) {
    return { success: false, message: "Senha incorreta. A conta não foi excluída." };
  }
  const neonApiKey = process.env.NEON_API_KEY?.trim();
  const neonProjectId = process.env.NEON_PROJECT_ID?.trim();
  const neonBranchId = process.env.NEON_BRANCH_ID?.trim();
  if (!neonApiKey || !neonProjectId || !neonBranchId) {
    console.error("Variáveis da Neon Management API ausentes.");
    return {
      success: false,
      message: "A exclusão de conta não está configurada corretamente."
    };
  }
  const endpoint = [
    "https://console.neon.tech/api/v2/projects",
    encodeURIComponent(neonProjectId),
    "branches",
    encodeURIComponent(neonBranchId),
    "auth/users",
    encodeURIComponent(authUser.id),
  ].join("/");
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${neonApiKey}`,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
  }
  catch (error) {
    console.error("Erro de rede ao excluir usuário do Neon Auth:", error);
    return {
      success: false,
      message: "Não foi possível falar com o Neon para excluir sua conta. Tente novamente."
    };
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Erro da Neon Management API ao excluir usuário:", {
      status: response.status,
      body
    });
    return {
      success: false,
      message: `Não foi possível excluir a conta do Neon Auth. Código ${response.status}.`
    };
  }
  const userId = Number(appUser.id);
  try {
    const reviews = await db.orm.public.Review.where({ userId }).all();
    for (const review of reviews) {
      await db.orm.public.Review.where({ id: Number(review.id), userId }).delete();
    }
    const listItems = await db.orm.public.UserAnime.where({ userId }).all();
    for (const item of listItems) {
      await db.orm.public.UserAnime.where({ id: Number(item.id), userId }).delete();
    }
    await db.orm.public.User.where({ id: userId }).delete();
  }
  catch (error) {
    console.error("Usuário removido do Neon Auth, mas houve erro ao limpar dados locais:", error);
  }
  try {
    await auth.signOut();
  }
  catch {
  }
  for (const path of ["/", "/dashboard", "/minha-lista", "/conta"]) {
    revalidatePath(path);
  }
  return { success: true, message: "Conta excluída com sucesso." };
}
