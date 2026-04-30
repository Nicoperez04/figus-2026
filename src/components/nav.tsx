"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, LinkButton } from "@/components/ui";
import { logoutAction } from "@/lib/actions";
import type { AuthUser } from "@/lib/auth";

export function BrandLogo({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md";
  href?: string;
}) {
  const dims = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
  }[size];

  return (
    <Link href={href} className="group inline-flex shrink-0 items-center">
      <Image
        src="/logo-figus-2026.png"
        alt="Figus 2026"
        width={96}
        height={96}
        priority
        className={`${dims} object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:scale-105`}
      />
    </Link>
  );
}

const headerShell =
  "relative isolate overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_140%_at_85%_0%,rgba(212,164,55,0.28)_0%,rgba(212,164,55,0)_55%),linear-gradient(90deg,#0b1220_0%,#064e3b_55%,#0d7a52_100%)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]";

export function PublicNav({ user }: { user: AuthUser | null }) {
  return (
    <header className="sticky top-0 z-30">
      <div className={headerShell}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-linear-to-b from-transparent via-white/15 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-linear-to-b from-transparent via-white/10 to-transparent"
        />
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                <LinkButton
                  href="/mi-album"
                  variant="ghost"
                  size="sm"
                  className="border-white/15! bg-white/5! text-white! hover:bg-white/15! hover:text-white!"
                >
                  Mi álbum
                </LinkButton>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="champion"
                    size="sm"
                  >
                    Salir
                  </Button>
                </form>
              </>
            ) : (
              <>
                <LinkButton
                  href="/login"
                  variant="ghost"
                  size="sm"
                  className="text-white/85! hover:bg-white/10! hover:text-white!"
                >
                  Iniciar sesión
                </LinkButton>
                <LinkButton href="/registro" variant="champion" size="sm">
                  Crear álbum
                </LinkButton>
              </>
            )}
          </div>
        </nav>
        <div className="accent-gold-thin h-px w-full opacity-80" />
      </div>
    </header>
  );
}

export function AppNav({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const links: { label: string; href: string }[] = [
    { label: "Mi álbum", href: "/mi-album" },
    { label: "Grupos", href: "/grupos" },
    { label: "Amigos", href: "/amigos" },
    { label: "Configuración", href: "/configuracion" },
    { label: "Link público", href: `/u/${user.publicSlug}/album` },
  ];

  return (
    <header className="sticky top-0 z-30">
      <div className={headerShell}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-linear-to-b from-transparent via-white/15 to-transparent"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-linear-to-b from-transparent via-white/10 to-transparent"
        />
        <nav className="relative mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <BrandLogo />
          <div className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 pb-0.5 lg:mx-0 lg:px-0 lg:pb-0">
            {links.map(({ label, href }) => {
              const active = pathname === href || pathname?.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative inline-flex h-8 shrink-0 items-center rounded-md px-2.5 text-[13px] font-medium transition ${
                    active
                      ? "text-white"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-2.5 bottom-[-7px] h-[2px] rounded-full bg-gold shadow-[0_0_8px_rgba(212,164,55,0.55)]"
                    />
                  ) : null}
                </Link>
              );
            })}
            <form action={logoutAction} className="ml-1.5 shrink-0">
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-white/80! hover:bg-white/10! hover:text-white!"
              >
                Salir
              </Button>
            </form>
          </div>
        </nav>
        <div className="accent-gold-thin h-px w-full opacity-80" />
      </div>
    </header>
  );
}
