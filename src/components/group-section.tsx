import { TeamPanel } from "@/components/team-panel";
import { Chip, ProgressBar } from "@/components/ui";
import { TEAM_STICKER_TITLES } from "@/lib/album-template";
import type { GroupedAlbum } from "@/lib/album";

const TEAM_STICKERS_TOTAL = TEAM_STICKER_TITLES.length;

type Props = {
  group: GroupedAlbum["groups"][number];
  isFiltering: boolean;
};

export function GroupSection({ group, isFiltering }: Props) {
  const visibleTeams = group.teams.filter((team) => team.stickers.length > 0);
  const hidden = group.teams.length - visibleTeams.length;

  return (
    <section id={`group-${group.letter}`} className="scroll-mt-32">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
              {group.letter}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fase de grupos</p>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Grupo {group.letter}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone="emerald">
              <span className="font-bold tabular-nums">
                {group.progress.obtained}/{group.progress.total}
              </span>
            </Chip>
            <Chip tone="emerald">
              <span className="font-bold tabular-nums">{group.progress.percent}%</span>
            </Chip>
            {group.progress.repeated > 0 ? <Chip tone="amber">{group.progress.repeated} rep</Chip> : null}
          </div>
        </header>
        <div className="mt-4">
          <ProgressBar percent={group.progress.percent} />
        </div>
        <div className="mt-4 grid gap-2.5">
          {visibleTeams.map((team) => (
            <TeamPanel
              key={team.id}
              team={team}
              totalStickers={TEAM_STICKERS_TOTAL}
              defaultOpen={isFiltering}
            />
          ))}
        </div>
        {visibleTeams.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
            Ninguna selección de este grupo cumple los filtros.
          </p>
        ) : null}
        {hidden > 0 && visibleTeams.length > 0 ? (
          <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
            {hidden} {hidden === 1 ? "selección oculta" : "selecciones ocultas"} por filtros
          </p>
        ) : null}
      </div>
    </section>
  );
}
