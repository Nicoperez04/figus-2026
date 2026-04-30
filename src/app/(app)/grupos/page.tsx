import Link from "next/link";
import { Flag } from "@/components/flag";
import { Chip, ProgressBar } from "@/components/ui";
import { getGroupsForUser } from "@/lib/album";
import { requireUser } from "@/lib/auth";

export default async function GroupsPage() {
  const user = await requireUser();
  const teams = await getGroupsForUser(user.id);
  const groups = Map.groupBy(teams, (team) => team.group);

  const overall = teams.reduce(
    (acc, team) => ({
      obtained: acc.obtained + team.progress.obtained,
      total: acc.total + team.progress.total,
    }),
    { obtained: 0, total: 0 },
  );
  const overallPercent = overall.total > 0 ? Math.round((overall.obtained / overall.total) * 100) : 0;

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Vista por grupos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Grupos A–L</h1>
          <p className="mt-1 text-sm text-slate-500">48 selecciones organizadas en 12 grupos.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Plantel global</p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
            {overall.obtained}<span className="text-slate-400"> / {overall.total}</span>{" "}
            <span className="text-sm font-semibold text-emerald-700">({overallPercent}%)</span>
          </p>
          <div className="mt-2 w-48">
            <ProgressBar percent={overallPercent} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from(groups.entries()).map(([group, groupTeams]) => {
          const groupObtained = groupTeams.reduce((sum, team) => sum + team.progress.obtained, 0);
          const groupTotal = groupTeams.reduce((sum, team) => sum + team.progress.total, 0);
          const groupPercent = groupTotal > 0 ? Math.round((groupObtained / groupTotal) * 100) : 0;
          return (
            <article key={group} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 sm:p-5">
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white">
                    {group}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Grupo</p>
                    <h2 className="text-base font-bold text-slate-900">Grupo {group}</h2>
                  </div>
                </div>
                <Chip tone="emerald">
                  <span className="font-bold tabular-nums">{groupPercent}%</span>
                </Chip>
              </header>
              <div className="mt-3">
                <ProgressBar percent={groupPercent} height="xs" />
              </div>
              <div className="mt-4 grid gap-1.5">
                {groupTeams.map((team) => (
                  <Link
                    key={team.id}
                    className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-slate-200 hover:bg-slate-50"
                    href={`/selecciones/${team.countryCode}`}
                  >
                    <Flag countryCode={team.countryCode} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{team.name}</p>
                        <p className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
                          {team.progress.obtained}/{team.progress.total}
                        </p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar percent={team.progress.percent} height="xs" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold tracking-wide text-slate-400">
                          {team.countryCode}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
