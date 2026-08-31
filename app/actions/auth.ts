"use server";

import { auth } from "../../lib/auth/server";

export async function signOutAction() {
  try {
    await auth.signOut();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);

    return {
      success: false,
    };
  }
}
