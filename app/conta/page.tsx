import SiteHeader from "../components/SiteHeader";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserRound } from "lucide-react";
import { requireCurrentAppUser } from "../../lib/auth/current-user";
import DeleteAccountForm from "./DeleteAccountForm";
export const dynamic = "force-dynamic";
export default async function ContaPage() {
  const user = await requireCurrentAppUser();
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <div className="mt-8">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-400">
          <UserRound className="h-4 w-4" />
          Minha conta
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Configurações da conta
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
          Consulte seus dados e gerencie sua conta do AnimeHub.
        </p>
      </div>
      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Dados da conta
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Informações vinculadas ao seu login.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Nome
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-zinc-200">
              {user.name ||
                "Não informado"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-[#111113] p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              E-mail
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-zinc-200">
              {user.email}
            </p>
          </div>
        </div>
      </section>
      <section className="mt-6">
        <DeleteAccountForm />
      </section>
    </div>
  </main>);
}
