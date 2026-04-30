import Link from "next/link";
import { Flag } from "@/components/flag";
import { StickerCard } from "@/components/sticker-card";
import { Chip, ProgressBar } from "@/components/ui";
import type { TeamGroup } from "@/lib/album";

type Props = {
  team: TeamGroup;
  totalStickers: number;
  defaultOpen?: boolean;
};

export function TeamPanel({ team, totalStickers, defaultOpen = false }: Props) {
  const showing = team.stickers.length;
  const isComplete = team.progress.total > 0 && team.progress.obtained === team.progress.total;

  return (
    <details
      className="group rounded-xl border border-slate-200 bg-white transition open:border-slate-300"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50 sm:px-4">
        <Flag countryCode={team.countryCode} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">{team.name}</h3>
            {isComplete ? <Chip tone="emerald">✓ Completa</Chip> : null}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            <span className="font-mono font-medium tracking-wide">{team.countryCode}</span>
            <span>·</span>
            <span className="font-semibold tabular-nums text-slate-700">
              {team.progress.obtained}/{team.progress.total}
            </span>
            {team.progress.repeated > 0 ? (
              <Chip tone="amber">{team.progress.repeated} rep</Chip>
            ) : null}
            {showing !== totalStickers ? (
              <Chip tone="blue">
                {showing}/{totalStickers} con filtro
              </Chip>
            ) : null}
          </div>
          <div className="mt-2">
            <ProgressBar percent={team.progress.percent} height="xs" />
          </div>
        </div>
        <ChevronIcon />
      </summary>
      <div className="border-t border-slate-100 px-3 py-4 sm:px-4">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {team.stickers.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} compact />
          ))}
        </div>
        {team.stickers.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
            No hay figuritas que cumplan los filtros para esta selección.
          </p>
        ) : null}
        <div className="mt-3 flex justify-end">
          <Link
            href={`/selecciones/${team.countryCode}`}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Ver detalle de {team.name}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </details>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
