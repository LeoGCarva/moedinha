import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/perfil", label: "Perfil" },
] as const;

/** Cabeçalho das páginas autenticadas. */
export function AppHeader({ current }: { current: "/" | "/perfil" }) {
  return (
    <header className="border-b border-linha bg-superficie">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link href="/" aria-label="Porquinho, início">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          {NAV.map((item) => {
            const active = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center rounded-campo px-4 font-semibold ${
                  active ? "bg-broto text-cofre" : "text-tinta-2 hover:bg-neutro hover:text-tinta"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
