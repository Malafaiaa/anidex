export default function Loading() {
  return (<main className="min-h-screen bg-[#09090b] text-white">
    <header className="border-b border-white/5 bg-[#09090b]/80">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center px-6">
        <div className="h-7 w-32 animate-pulse rounded-lg bg-white/10" />
      </div>
    </header>
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="h-4 w-24 animate-pulse rounded bg-violet-500/20" />
        <div className="mt-4 h-12 w-80 max-w-full animate-pulse rounded-xl bg-white/10" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-white/5" />
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <div className="h-4 w-20 animate-pulse rounded bg-violet-500/20" />
        <div className="mt-3 h-9 w-56 animate-pulse rounded-lg bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({
          length: 12
        }).map((_, index) => (<div key={index} className="animate-pulse">
          <div className="aspect-[2/3] rounded-2xl border border-white/5 bg-white/[0.06]" />
          <div className="mt-4 h-5 rounded bg-white/[0.07]" />
          <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.04]" />
        </div>))}
      </div>
    </section>
  </main>);
}
