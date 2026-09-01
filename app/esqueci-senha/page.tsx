"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  RefreshCw
} from "lucide-react";
import { FormEvent, useState } from "react";
import { authClient } from "../../lib/auth/client";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendCode() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Informe seu e-mail.");
      return false;
    }

    const result = await authClient.emailOtp.requestPasswordReset({
      email: cleanEmail
    });

    if (result.error) {
      setError(result.error.message || "Não foi possível enviar o código.");
      return false;
    }

    setEmail(cleanEmail);
    return true;
  }

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const sent = await sendCode();
      if (!sent) return;

      setMessage("Enviamos um código para o seu e-mail.");
      setStep("reset");
    } catch (error) {
      console.error(error);
      setError("Não foi possível enviar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanCode = code.trim();

    if (!cleanCode) {
      setError("Digite o código recebido por e-mail.");
      return;
    }

    if (password.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.emailOtp.resetPassword({
        email,
        otp: cleanCode,
        password
      });

      if (result.error) {
        setError(result.error.message || "Código inválido ou expirado.");
        return;
      }

      setStep("done");
    } catch (error) {
      console.error(error);
      setError("Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const sent = await sendCode();
      if (!sent) return;

      setCode("");
      setMessage("Novo código enviado para o seu e-mail.");
    } catch (error) {
      console.error(error);
      setError("Não foi possível reenviar o código.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute left-[10%] top-[10%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[5%] right-[10%] h-[380px] w-[380px] rounded-full bg-fuchsia-600/[0.07] blur-[140px]" />

      <div className="relative w-full max-w-md">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          {step === "email" && (
            <>
              <div className="mb-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                  <KeyRound className="h-3.5 w-3.5" />
                  Recuperar acesso
                </div>
                <h1 className="text-3xl font-black tracking-tight">Esqueceu sua senha?</h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Informe o e-mail da sua conta e enviaremos um código para criar uma nova senha.
                </p>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="voce@email.com"
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="mb-7">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                  <Mail className="h-3.5 w-3.5" />
                  Código enviado
                </div>
                <h1 className="text-3xl font-black tracking-tight">Crie uma nova senha</h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Digite o código enviado para <span className="text-zinc-300">{email}</span> e escolha sua nova senha.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="code" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Código
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
                    placeholder="Digite o código"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-center text-lg font-semibold tracking-[0.35em] text-zinc-100 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Nova senha
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Mínimo de 8 caracteres"
                      className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 pr-12 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Digite novamente"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
                  />
                </div>

                {message && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  {loading ? "Alterando..." : "Alterar senha"}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                  {resending ? "Reenviando..." : "Reenviar código"}
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Senha alterada</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Sua nova senha foi salva. Agora você já pode entrar novamente no AniDex.
              </p>
              <Link
                href="/login"
                className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
