"use client";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, MailCheck, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth/client";
type CadastroStep = "dados" | "verificacao";
export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep,] = useState<CadastroStep>("dados");
  const [name, setName,] = useState("");
  const [email, setEmail,] = useState("");
  const [password, setPassword,] = useState("");
  const [confirmPassword, setConfirmPassword,] = useState("");
  const [code, setCode,] = useState("");
  const [showPassword, setShowPassword,] = useState(false);
  const [loading, setLoading,] = useState(false);
  const [resending, setResending,] = useState(false);
  const [error, setError,] = useState("");
  const [message, setMessage,] = useState("");
  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanName = name.trim();
    const cleanEmail = email
      .trim()
      .toLowerCase();
    if (cleanName.length <
      2) {
      setError("Informe seu nome.");
      return;
    }
    if (password.length <
      8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !==
      confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient
        .signUp
        .email({
          name: cleanName,
          email: cleanEmail,
          password
        });
      if (result.error) {
        setError(result.error
          .message ||
          "Não foi possível criar a conta.");
        return;
      }
      setEmail(cleanEmail);
      setCode("");
      setMessage(`Enviamos um código de verificação para ${cleanEmail}.`);
      setStep("verificacao");
    }
    catch (error) {
      console.error(error);
      setError("Não foi possível criar a conta. Tente novamente.");
    }
    finally {
      setLoading(false);
    }
  }
  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanCode = code.trim();
    if (cleanCode.length ===
      0) {
      setError("Digite o código recebido por e-mail.");
      return;
    }
    setLoading(true);
    try {
      const result = await authClient
        .emailOtp
        .verifyEmail({
          email: email
            .trim()
            .toLowerCase(),
          otp: cleanCode
        });
      if (result.error) {
        setError(result.error
          .message ||
          "Código inválido ou expirado.");
        return;
      }
      const signInResult = await authClient
        .signIn
        .email({
          email: email
            .trim()
            .toLowerCase(),
          password
        });
      if (signInResult.error) {
        router.replace("/login");
        router.refresh();
        return;
      }
      router.replace("/");
      router.refresh();
    }
    catch (error) {
      console.error(error);
      setError("Não foi possível verificar o código. Tente novamente.");
    }
    finally {
      setLoading(false);
    }
  }
  async function handleResend() {
    setError("");
    setMessage("");
    setResending(true);
    try {
      const result = await authClient
        .emailOtp
        .sendVerificationOtp({
          email: email
            .trim()
            .toLowerCase(),
          type: "email-verification"
        });
      if (result.error) {
        setError(result.error
          .message ||
          "Não foi possível reenviar o código.");
        return;
      }
      setMessage("Novo código enviado para o seu e-mail.");
    }
    catch (error) {
      console.error(error);
      setError("Não foi possível reenviar o código.");
    }
    finally {
      setResending(false);
    }
  }
  return (<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 py-12 text-white">
    <div className="pointer-events-none absolute left-[10%] top-[8%] h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[140px]" />
    <div className="pointer-events-none absolute bottom-[5%] right-[8%] h-[380px] w-[380px] rounded-full bg-fuchsia-600/[0.07] blur-[140px]" />
    <div className="relative w-full max-w-md">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Voltar para o AnimeHub
      </Link>
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        {step ===
          "dados" ? (<>
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                <Sparkles className="h-3.5 w-3.5" />
                Crie seu perfil
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                Entre para o{" "}
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
                  AniDex
                </span>
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Sua lista, progresso e avaliações ficam vinculados à sua conta.
              </p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Nome
                </label>
                <input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  E-mail
                </label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Senha
                </label>
                <div className="relative">
                  <input id="password" type={showPassword
                    ? "text"
                    : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 pr-12 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-300" aria-label={showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"}>
                    {showPassword ? (<EyeOff className="h-4 w-4" />) : (<Eye className="h-4 w-4" />)}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Confirmar senha
                </label>
                <input id="confirmPassword" type={showPassword
                  ? "text"
                  : "password"} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Digite a senha novamente" className="h-12 w-full rounded-xl border border-white/10 bg-[#111113] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
              </div>
              {error && (<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>)}
              <button type="submit" disabled={loading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (<>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Criando conta...
                </>) : (<>
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                </>)}
              </button>
            </form>
            <div className="mt-6 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
              Já possui conta?{" "}
              <Link href="/login" className="font-semibold text-violet-400 transition hover:text-violet-300">
                Entrar
              </Link>
            </div>
          </>) : (<>
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300">
                <MailCheck className="h-3.5 w-3.5" />
                Verificação de e-mail
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                Confira seu e-mail
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Digite o código enviado para{" "}
                <span className="font-medium text-zinc-300">
                  {email}
                </span>
                .
              </p>
            </div>
            {message && (<div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </div>)}
            {error && (<div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>)}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Código de verificação
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
                  <input id="verification-code" type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus required value={code} onChange={(event) => setCode(event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6))} placeholder="000000" className="h-14 w-full rounded-xl border border-white/10 bg-[#111113] px-12 text-center text-xl font-bold tracking-[0.35em] text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10" />
                </div>
              </div>
              <button type="submit" disabled={loading ||
                code.length ===
                0} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (<>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Verificando...
                </>) : (<>
                  <MailCheck className="h-4 w-4" />
                  Verificar e-mail
                </>)}
              </button>
            </form>
            <div className="mt-6 border-t border-white/10 pt-6">
              <button type="button" disabled={resending ||
                loading} onClick={handleResend} className="flex w-full items-center justify-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
                {resending ? (<>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Reenviando...
                </>) : (<>
                  <RefreshCw className="h-4 w-4" />
                  Reenviar código
                </>)}
              </button>
              <button type="button" disabled={loading ||
                resending} onClick={() => {
                  setError("");
                  setMessage("");
                  setCode("");
                  setStep("dados");
                }} className="mt-4 w-full text-center text-xs text-zinc-600 transition hover:text-zinc-400 disabled:opacity-50">
                Alterar dados do cadastro
              </button>
            </div>
          </>)}
      </div>
    </div>
  </main>);
}
