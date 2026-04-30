import { STICKER_TYPE, type SectionType, type StickerType } from "@/lib/album-types";

export type StickerFilter = "all" | "missing" | "owned" | "repeated" | "special";

export type StickerView = {
  id: string;
  code: string;
  title: string;
  sectionName: string;
  teamName: string | null;
  group: string | null;
  type: StickerType;
  orderGlobal: number;
  orderInTeam: number | null;
  ownedQuantity: number;
  repeatedQuantity: number;
  status: "Falta" | "La tengo" | "Repetida";
};

export type TeamGroup = {
  id: string;
  name: string;
  group: string;
  countryCode: string;
  /** Orden dentro del grupo (fixture oficial), menor primero. */
  order: number;
  stickers: StickerView[];
  progress: ReturnType<typeof calculateProgress>;
};

export type SectionGroup = {
  id: string;
  type: SectionType;
  name: string;
  group: string;
  order: number;
  stickers: StickerView[];
  progress: ReturnType<typeof calculateProgress>;
  teams: TeamGroup[];
};

export type GroupedAlbum = {
  intro: SectionGroup | null;
  groups: { letter: string; teams: TeamGroup[]; progress: ReturnType<typeof calculateProgress>; sectionId: string }[];
  /** FWC 9–19 al final del álbum. */
  fwcClosing: SectionGroup | null;
};

export function calculateProgress(stickers: StickerView[]) {
  const total = stickers.length;
  const obtained = stickers.filter((sticker) => sticker.ownedQuantity > 0).length;
  const missing = total - obtained;
  const repeated = stickers.reduce((sum, sticker) => sum + sticker.repeatedQuantity, 0);
  const percent = total > 0 ? Math.round((obtained / total) * 100) : 0;

  return { total, obtained, missing, repeated, percent };
}

function normalizeForSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function applyStickerFilter(stickers: StickerView[], options?: { filter?: StickerFilter; query?: string }) {
  let filtered = stickers;
  const rawQuery = options?.query?.trim();
  const query = rawQuery ? normalizeForSearch(rawQuery) : "";

  if (query) {
    filtered = filtered.filter((sticker) => {
      const haystack = normalizeForSearch(
        [
          sticker.code,
          sticker.title,
          sticker.group ?? "",
          sticker.teamName ?? "",
          sticker.sectionName,
          sticker.group ? `grupo ${sticker.group}` : "",
        ].join(" "),
      );
      return haystack.includes(query);
    });
  }

  if (options?.filter === "missing") {
    filtered = filtered.filter((sticker) => sticker.ownedQuantity === 0);
  } else if (options?.filter === "owned") {
    filtered = filtered.filter((sticker) => sticker.ownedQuantity > 0);
  } else if (options?.filter === "repeated") {
    filtered = filtered.filter((sticker) => sticker.repeatedQuantity > 0);
  } else if (options?.filter === "special") {
    filtered = filtered.filter(
      (sticker) =>
        sticker.type === STICKER_TYPE.ESPECIAL ||
        sticker.type === STICKER_TYPE.ESTADIO ||
        sticker.type === STICKER_TYPE.CAMPEON,
    );
  }

  return filtered;
}

/** Filtra por texto de búsqueda el álbum ya armado (filtros de pestaña aplicados en servidor). */
export function filterGroupedAlbumByQuery(grouped: GroupedAlbum, query: string): GroupedAlbum {
  const raw = query.trim();
  if (!raw) return grouped;

  const intro = grouped.intro
    ? {
        ...grouped.intro,
        stickers: applyStickerFilter(grouped.intro.stickers, { query: raw }),
      }
    : null;

  const groups = grouped.groups
    .map((g) => ({
      ...g,
      teams: g.teams
        .map((team) => ({
          ...team,
          stickers: applyStickerFilter(team.stickers, { query: raw }),
        }))
        .filter((team) => team.stickers.length > 0),
    }))
    .filter((g) => g.teams.length > 0);

  const fwcClosing = grouped.fwcClosing
    ? {
        ...grouped.fwcClosing,
        stickers: applyStickerFilter(grouped.fwcClosing.stickers, { query: raw }),
      }
    : null;

  return { intro, groups, fwcClosing };
}
