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
export default function SiteHeader({ active, backHref, backLabel = "Voltar", showNav = true, wide = false }: SiteHeaderProps) {
  const maxWidth = wide ? "max-w-[1500px]" : "max-w-7xl";
  return (<header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090b]/85 backdrop-blur-xl">
    <div className={`mx-auto flex h-[72px] ${maxWidth} items-center justify-between px-6`}>
      <Link href="/" className="text-2xl font-black tracking-tight">
        Ani
        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
          Dex
        </span>
      </Link>
      {showNav && (<nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
        {links.map((link) => (<Link key={link.key} href={link.href} className={active === link.key
          ? "font-medium text-white"
          : "transition hover:text-white"}>
          {link.label}
        </Link>))}
      </nav>)}
      {backHref ? (<Link href={backHref} className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>) : (<AuthButton />)}
    </div>
  </header>);
}
