import { AlbumOutline } from "@/components/album-outline";
import { AlbumFilters, computeFilterTotals } from "@/components/filters";
import { GroupSection } from "@/components/group-section";
import { ProgressSummary } from "@/components/progress-summary";
import { SpecialSection } from "@/components/special-section";
import { getGroupedAlbumForUser, type StickerFilter } from "@/lib/album";
import { requireUser } from "@/lib/auth";

const allowedFilters: StickerFilter[] = ["all", "missing", "owned", "repeated", "special"];

export default async function MyAlbumPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filter = allowedFilters.includes(params.filter as StickerFilter) ? (params.filter as StickerFilter) : "all";
  const query = params.q ?? "";
  const album = await getGroupedAlbumForUser(user.id, { filter, query });
  const totals = computeFilterTotals(album.all);
  const isFiltering = filter !== "all" || query.trim().length > 0;

  const visibleGroups = album.grouped.groups.filter((group) =>
    group.teams.some((team) => team.stickers.length > 0),
  );
  const introVisible = album.grouped.intro && album.grouped.intro.stickers.length > 0;
  const fwcClosingVisible = album.grouped.fwcClosing && album.grouped.fwcClosing.stickers.length > 0;
  const hasAnyResult =
    visibleGroups.length > 0 || introVisible || fwcClosingVisible;

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-emerald-700">Hola, {user.name}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mi álbum</h1>
        <p className="text-sm text-slate-500">Organizado por secciones especiales y los doce grupos del Mundial.</p>
      </header>

      <ProgressSummary stickers={album.all} />

      <AlbumOutline grouped={album.grouped} />

      <AlbumFilters current={filter} query={query} totals={totals} />

      {!hasAnyResult ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <SearchEmptyIcon />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">No encontramos figuritas con esos filtros</p>
          <p className="mt-1 text-xs text-slate-500">Probá con otra palabra o cambiá el filtro activo.</p>
        </div>
      ) : null}

      <div className="space-y-4">
        {introVisible && album.grouped.intro ? (
          <SpecialSection
            anchorId="section-intro"
            emoji="🎉"
            accent="violet"
            subtitle="Inicio del álbum"
            section={album.grouped.intro}
          />
        ) : null}

        {visibleGroups.length > 0 ? (
          <section className="space-y-3">
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fase de grupos</h2>
            <div className="space-y-4">
              {visibleGroups.map((group) => (
                <GroupSection key={group.letter} group={group} isFiltering={isFiltering} />
              ))}
            </div>
          </section>
        ) : null}

        {fwcClosingVisible && album.grouped.fwcClosing ? (
          <SpecialSection
            anchorId="section-fwc"
            emoji="🌐"
            accent="sky"
            subtitle="Cierre del álbum (FWC)"
            section={album.grouped.fwcClosing}
          />
        ) : null}
      </div>
    </main>
  );
}

function SearchEmptyIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
