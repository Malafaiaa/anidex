"use client";

import Link from "next/link";
import { LoaderCircle, LogIn, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { authClient } from "../../lib/auth/client";
import { signOutAction } from "../actions/auth";

export default function AuthButton() {
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const result = await signOutAction();

      if (!result?.success) {
        setIsSigningOut(false);
        return;
      }

      window.location.replace("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
      setIsSigningOut(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-zinc-500 sm:min-w-[92px] sm:px-4">
        <LoaderCircle className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-3 text-sm font-semibold text-white transition hover:bg-violet-500 sm:px-5"
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href="/conta"
        title="Gerenciar conta"
        aria-label="Gerenciar conta"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-violet-500/30 hover:bg-violet-500/[0.06] hover:text-white sm:w-auto sm:gap-2 sm:px-3"
      >
        <UserRound className="h-4 w-4 shrink-0 text-violet-400" />
        <span className="hidden max-w-[140px] truncate sm:inline">
          {session.user.name || session.user.email}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
      >
        {isSigningOut ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="hidden min-[360px]:inline">{isSigningOut ? "Saindo..." : "Sair"}</span>
      </button>
    </div>
  );
}
