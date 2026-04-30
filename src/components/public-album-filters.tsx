import Link from "next/link";
import type { PublicAlbumFilter, PublicAlbumGroupOption } from "@/lib/album";

type Props = {
  basePath: string;
  current: PublicAlbumFilter;
  group: string;
  team: string;
  groupOptions: PublicAlbumGroupOption[];
  totals: Record<PublicAlbumFilter, number>;
};

const filters: { value: PublicAlbumFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "missing", label: "Le faltan" },
  { value: "owned", label: "Las tiene" },
  { value: "repeated", label: "Repetidas" },
];

function buildUrl(basePath: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all" && value !== "") search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PublicAlbumFilters({ basePath, current, group, team, groupOptions, totals }: Props) {
  const visibleTeams = group
    ? groupOptions.find((option) => option.letter === group)?.teams ?? []
    : groupOptions.flatMap((option) => option.teams);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Filtros</h2>
        {(current !== "all" || group || team) && (
          <Link
            href={basePath}
            className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 hover:text-emerald-800"
          >
            Limpiar
          </Link>
        )}
      </header>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Estado</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {filters.map((option) => {
            const active = current === option.value;
            const href = buildUrl(basePath, { filter: option.value, group, team });
            const count = totals[option.value];
            return (
              <Link
                key={option.value}
                href={href}
                className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold leading-4 tabular-nums ${
                    active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Grupo</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Link
              href={buildUrl(basePath, { filter: current })}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                !group
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Todos
            </Link>
            {groupOptions.map((option) => {
              const active = group === option.letter;
              return (
                <Link
                  key={option.letter}
                  href={buildUrl(basePath, { filter: current, group: option.letter })}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Grupo {option.letter}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Selección</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Link
              href={buildUrl(basePath, { filter: current, group })}
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                !team
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Todas
            </Link>
            {visibleTeams.slice(0, 24).map((option) => {
              const active = team === option.name;
              return (
                <Link
                  key={option.name}
                  href={buildUrl(basePath, { filter: current, group, team: option.name })}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {option.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
