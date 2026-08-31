import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthButton from "./AuthButton";

type SiteHeaderProps = {
  active?: "discover" | "list" | "dashboard";
  backHref?: string;
  backLabel?: string;
  showNav?: boolean;
  wide?: boolean;
};

const links = [
  { key: "discover", href: "/animes", label: "Descobrir" },
  { key: "list", href: "/minha-lista", label: "Minha Lista" },
  { key: "dashboard", href: "/dashboard", label: "Dashboard" },
] as const;

function NavLinks({ active, mobile = false }: { active?: SiteHeaderProps["active"]; mobile?: boolean }) {
  return links.map((link) => (
    <Link
      key={link.key}
      href={link.href}
      className={mobile
        ? `flex h-9 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${active === link.key ? "bg-violet-500/15 text-violet-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`
        : active === link.key
          ? "font-medium text-white"
          : "transition hover:text-white"}
    >
      {link.label}
    </Link>
  ));
}

export default function SiteHeader({ active, backHref, backLabel = "Voltar", showNav = true, wide = false }: SiteHeaderProps) {
  const maxWidth = wide ? "max-w-[1500px]" : "max-w-7xl";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/90 backdrop-blur-xl">
      <div className={`mx-auto flex h-16 ${maxWidth} items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6`}>
        <Link href="/" className="shrink-0 text-xl font-black tracking-tight sm:text-2xl">
          Ani
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
            Dex
          </span>
        </Link>

        {showNav && (
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <NavLinks active={active} />
          </nav>
        )}

        {backHref ? (
          <Link href={backHref} className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden min-[360px]:inline">{backLabel}</span>
          </Link>
        ) : (
          <AuthButton />
        )}
      </div>

      {showNav && (
        <nav className={`mx-auto grid ${maxWidth} grid-cols-3 gap-1 px-4 pb-2 md:hidden`}>
          <NavLinks active={active} mobile />
        </nav>
      )}
    </header>
  );
}
