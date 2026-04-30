"use client";

import Link from "next/link";
import { Input } from "@/components/ui";
import type { StickerFilter, StickerView } from "@/lib/album-model";
import { STICKER_TYPE } from "@/lib/album-types";

type FilterDef = {
  value: StickerFilter;
  label: string;
};

const filters: FilterDef[] = [
  { value: "all", label: "Todas" },
  { value: "missing", label: "Me faltan" },
  { value: "owned", label: "Tengo" },
  { value: "repeated", label: "Repetidas" },
  { value: "special", label: "Especiales" },
];

export function AlbumFilters({
  current,
  searchQuery,
  onSearchChange,
  totals,
}: {
  current: StickerFilter;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  totals?: Partial<Record<StickerFilter, number>>;
}) {
  return (
    <div className="sticky top-[68px] z-10 -mx-4 space-y-2.5 border-b border-slate-200/70 bg-(--background)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[76px]">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Buscar por número, país, grupo o nombre"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<SearchIcon />}
          aria-label="Buscar figuritas"
        />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {filters.map((filter) => {
          const href = filter.value === "all" ? "/mi-album" : `/mi-album?filter=${filter.value}`;
          const active = current === filter.value;
          const count = totals?.[filter.value];
          return (
            <Link
              key={filter.value}
              className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
              href={href}
            >
              <span>{filter.label}</span>
              {typeof count === "number" ? (
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold leading-4 tabular-nums ${
                    active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
        <Link
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          href="/grupos"
        >
          Vista por grupo
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

export function computeFilterTotals(stickers: StickerView[]): Record<StickerFilter, number> {
  let owned = 0;
  let missing = 0;
  let repeated = 0;
  let special = 0;
  for (const sticker of stickers) {
    if (sticker.ownedQuantity > 0) owned += 1;
    else missing += 1;
    if (sticker.repeatedQuantity > 0) repeated += 1;
    if (
      sticker.type === STICKER_TYPE.ESPECIAL ||
      sticker.type === STICKER_TYPE.ESTADIO ||
      sticker.type === STICKER_TYPE.CAMPEON
    ) {
      special += 1;
    }
  }
  return {
    all: stickers.length,
    owned,
    missing,
    repeated,
    special,
  };
}

function SearchIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
