import Link from "next/link";
import { Flag } from "@/components/flag";
import { ProgressSummary } from "@/components/progress-summary";
import { QuickStatusButtons, StickerCard } from "@/components/sticker-card";
import { Chip } from "@/components/ui";
import { getTeamAlbum, type StickerView } from "@/lib/album";
import { STICKER_TYPE } from "@/lib/album-types";
import { requireUser } from "@/lib/auth";

export default async function TeamPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const user = await requireUser();
  const { countryCode } = await params;
  const album = await getTeamAlbum(user.id, countryCode.toUpperCase());

  const escudo = album.stickers.filter((sticker) => sticker.type === STICKER_TYPE.ESCUDO);
  const equipo = album.stickers.filter((sticker) => sticker.type === STICKER_TYPE.EQUIPO);
  const jugadores = album.stickers.filter((sticker) => sticker.type === STICKER_TYPE.JUGADOR);
  const otros = album.stickers.filter(
    (sticker) =>
      sticker.type !== STICKER_TYPE.ESCUDO &&
      sticker.type !== STICKER_TYPE.EQUIPO &&
      sticker.type !== STICKER_TYPE.JUGADOR,
  );

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <Link
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-emerald-700"
        href="/grupos"
      >
        <span aria-hidden>←</span> Volver a grupos
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Flag countryCode={album.team.countryCode} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <Chip tone="emerald">Grupo {album.team.group}</Chip>
                <span className="font-mono text-[11px] font-semibold text-slate-500">{album.team.countryCode}</span>
              </div>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {album.team.name}
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-72">
            <Stat label="Tengo" value={`${album.progress.obtained}`} />
            <Stat label="Faltan" value={`${album.progress.missing}`} />
            <Stat label="Progreso" value={`${album.progress.percent}%`} />
          </div>
        </div>
      </section>

      <ProgressSummary stickers={album.stickers} />

      <TypeSection title="Escudo" emoji="🛡️" stickers={escudo} />
      <TypeSection title="Formación" emoji="📋" stickers={equipo} />
      <TypeSection title="Jugadores" emoji="⚽" stickers={jugadores} grid="players" />
      {otros.length > 0 ? <TypeSection title="Otras" emoji="✨" stickers={otros} /> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-base font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function TypeSection({
  title,
  emoji,
  stickers,
  grid = "default",
}: {
  title: string;
  emoji: string;
  stickers: StickerView[];
  grid?: "default" | "players";
}) {
  if (stickers.length === 0) return null;
  const obtained = stickers.filter((sticker) => sticker.ownedQuantity > 0).length;
  const gridClass =
    grid === "players"
      ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      : "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-lg" aria-hidden>
            {emoji}
          </span>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        <Chip tone="emerald">
          <span className="font-bold tabular-nums">
            {obtained}/{stickers.length}
          </span>
        </Chip>
      </header>
      <div className={`mt-4 ${gridClass}`}>
        {stickers.map((sticker) => (
          <div key={sticker.id} className="flex flex-col">
            <StickerCard sticker={sticker} compact />
            <QuickStatusButtons stickerId={sticker.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
