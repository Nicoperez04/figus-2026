"use client";

import { useEffect, useMemo, useState } from "react";
import { AlbumFilters, computeFilterTotals } from "@/components/filters";
import { GroupSection } from "@/components/group-section";
import { SpecialSection } from "@/components/special-section";
import { filterGroupedAlbumByQuery, type GroupedAlbum, type StickerFilter, type StickerView } from "@/lib/album-model";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type Props = {
  grouped: GroupedAlbum;
  allStickers: StickerView[];
  filter: StickerFilter;
  initialQuery: string;
};

export function MiAlbumBody({ grouped, allStickers, filter, initialQuery }: Props) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 200);

  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const filteredGrouped = useMemo(
    () => filterGroupedAlbumByQuery(grouped, debouncedSearch),
    [grouped, debouncedSearch],
  );

  const totals = computeFilterTotals(allStickers);

  const visibleGroups = filteredGrouped.groups.filter((group) => group.teams.some((team) => team.stickers.length > 0));
  const introVisible = filteredGrouped.intro && filteredGrouped.intro.stickers.length > 0;
  const fwcClosingVisible = filteredGrouped.fwcClosing && filteredGrouped.fwcClosing.stickers.length > 0;
  const hasAnyResult = visibleGroups.length > 0 || introVisible || fwcClosingVisible;

  const isFiltering = filter !== "all" || debouncedSearch.length > 0;

  return (
    <>
      <AlbumFilters current={filter} searchQuery={searchInput} onSearchChange={setSearchInput} totals={totals} />

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
        {introVisible && filteredGrouped.intro ? (
          <SpecialSection
            anchorId="section-intro"
            emoji="🎉"
            accent="violet"
            subtitle="Inicio del álbum"
            section={filteredGrouped.intro}
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

        {fwcClosingVisible && filteredGrouped.fwcClosing ? (
          <SpecialSection
            anchorId="section-fwc"
            emoji="🌐"
            accent="sky"
            subtitle="Cierre del álbum (FWC)"
            section={filteredGrouped.fwcClosing}
          />
        ) : null}
      </div>
    </>
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
