import { LinkButton } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { PublicNav } from "@/components/nav";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <PublicNav user={user} />
      <main className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(60%_60%_at_15%_0%,rgba(13,122,82,0.08),transparent_70%),radial-gradient(50%_60%_at_88%_8%,rgba(212,164,55,0.10),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <section>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="brand-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
              </span>
              Mundial FIFA · 2026
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-[44px] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px]">
              Tu álbum de figuritas,{" "}
              <span className="relative whitespace-nowrap">
                <span className="brand-wordmark">listo para la final</span>
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Marcá las que tenés, faltan o repetís. Compartí tu álbum con un link público y compará automáticamente con amigos.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <LinkButton href={user ? "/mi-album" : "/registro"} variant="primary" size="lg">
                {user ? "Ir a mi álbum" : "Crear álbum gratis"}
              </LinkButton>
              <LinkButton href={user ? "/grupos" : "/login"} variant="secondary" size="lg">
                {user ? "Ver grupos" : "Iniciar sesión"}
              </LinkButton>
            </div>
            <ul className="mt-8 grid gap-2 text-[13px] text-slate-600 sm:grid-cols-3">
              <Bullet>Organización por grupo y selección</Bullet>
              <Bullet>Intercambios sugeridos</Bullet>
              <Bullet>Link público para compartir</Bullet>
            </ul>
          </section>

          <section className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(13,122,82,0.12),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(212,164,55,0.16),transparent_60%)] blur-2xl" />
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_48px_-28px_rgba(11,18,32,0.25)]">
              <div className="relative overflow-hidden rounded-xl bg-pitch p-5 text-white">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.18] [background:repeating-linear-gradient(115deg,rgba(255,255,255,0.6)_0_1px,transparent_1px_18px)]"
                />
                <div className="relative flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-100/90">
                    Vista previa
                  </p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-50 ring-1 ring-white/15">
                    Panini · 26
                  </span>
                </div>
                <h2 className="relative mt-2 font-display text-xl font-semibold tracking-tight">
                  Álbum Mundial 2026
                </h2>
                <div className="relative mt-4 grid grid-cols-3 gap-2">
                  {["ARG-01", "BRA-03", "INTRO-000", "FWC-05", "URU-20", "FWC-19"].map((code, index) => (
                    <div
                      key={code}
                      className={`rounded-md p-3 text-center font-mono text-[11px] font-bold transition ${
                        index % 3 === 0
                          ? "bg-gold text-amber-950 shadow-[0_2px_6px_-2px_rgba(212,164,55,0.5)]"
                          : "bg-white/10 text-white ring-1 ring-white/10"
                      }`}
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <div className="relative mt-5 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-2/3 rounded-full bg-gold" />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-emerald-50/90">67%</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700"
      >
        ✓
      </span>
      {children}
    </li>
  );
}
