import { LoaderCircle, Sparkles } from "lucide-react";
export default function LoadingAnimeDetails() {
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <header className="border-b border-white/5 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-black tracking-tight">
          Anime
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            Hub
          </span>
        </h1>
        <div className="hidden items-center gap-7 md:flex">
          <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </header>
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-7 flex items-center gap-3 rounded-2xl border border-violet-500/15 bg-violet-500/[0.05] px-4 py-3 text-sm text-violet-300">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Carregando detalhes do anime...
      </div>
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="aspect-[2/3] w-full animate-pulse rounded-3xl border border-white/10 bg-white/[0.05]" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-400">
            <Sparkles className="h-4 w-4" />
            Buscando informações
          </div>
          <div className="mt-5 h-10 w-4/5 animate-pulse rounded-xl bg-white/[0.07]" />
          <div className="mt-3 h-5 w-2/5 animate-pulse rounded-lg bg-white/[0.05]" />
          <div className="mt-7 flex flex-wrap gap-2">
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/[0.05]" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/[0.05]" />
            <div className="h-8 w-16 animate-pulse rounded-full bg-white/[0.05]" />
            <div className="h-8 w-28 animate-pulse rounded-full bg-white/[0.05]" />
          </div>
          <div className="mt-9 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
            <div className="h-4 w-[94%] animate-pulse rounded bg-white/[0.05]" />
            <div className="h-4 w-[88%] animate-pulse rounded bg-white/[0.05]" />
            <div className="h-4 w-[72%] animate-pulse rounded bg-white/[0.05]" />
          </div>
          <div className="mt-10 h-6 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
            <div className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
            <div className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
            <div className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
          </div>
        </div>
        <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <div className="h-5 w-28 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-5 h-11 w-full animate-pulse rounded-xl bg-white/[0.05]" />
          <div className="mt-3 h-11 w-full animate-pulse rounded-xl bg-violet-500/15" />
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </aside>
      </div>
      <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (<div key={index} className="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />))}
        </div>
      </div>
    </section>
  </main>);
}
