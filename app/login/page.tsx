"use client";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LogIn, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth/client";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password
      });
      if (result.error) {
        setError(result.error.message || "Não foi possível entrar.");
        return;
      }
      router.push("/");
      router.refresh();
    }
    catch {
      setError("Não foi possível entrar. Tente novamente.");
    }
    finally {
      setLoading(false);
    }
  }
  return (<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 py-12 text-white">
    <div className="pointer-events-none absolute left-[10%] top-[10%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />
    <div className="pointer-events-none absolute bottom-[5%] right-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-600/[0.07] blur-[140px]" />
    <div className="relative w-full max-w-md">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o AniDex
      </Link>
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div className="mb-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Bem-vindo de volta
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Entrar no <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">AnimeHub</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Acesse sua lista, progresso e avaliações.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">E-mail</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">Senha</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 pr-12 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && (<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>)}
          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? (<>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Entrando...
            </>) : (<>
              <LogIn className="h-4 w-4" />
              Entrar
            </>)}
          </button>
        </form>
        <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-violet-400 transition hover:text-violet-300">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  </main>);
}
