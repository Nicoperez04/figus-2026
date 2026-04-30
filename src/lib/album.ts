import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { ALBUM_SLUG } from "@/lib/album-template";
import { SECTION_TYPE, STICKER_TYPE, type SectionType, type StickerType } from "@/lib/album-types";
import { prisma } from "@/lib/prisma";

export type StickerFilter = "all" | "missing" | "owned" | "repeated" | "special";

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

export type TeamGroup = {
  id: string;
  name: string;
  group: string;
  countryCode: string;
  stickers: StickerView[];
  progress: ReturnType<typeof calculateProgress>;
};

export type GroupedAlbum = {
  intro: SectionGroup | null;
  groups: { letter: string; teams: TeamGroup[]; progress: ReturnType<typeof calculateProgress>; sectionId: string }[];
  /** FWC 9–19 al final del álbum. */
  fwcClosing: SectionGroup | null;
};

export const stickerWithStateInclude = {
  section: true,
  team: true,
} satisfies Prisma.StickerInclude;

export type StickerWithRelations = Prisma.StickerGetPayload<{
  include: typeof stickerWithStateInclude;
}>;

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

export function toStickerView(
  sticker: StickerWithRelations,
  userSticker?: { ownedQuantity: number; repeatedQuantity: number } | null,
): StickerView {
  const ownedQuantity = userSticker?.ownedQuantity ?? 0;
  const repeatedQuantity = Math.max(userSticker?.repeatedQuantity ?? ownedQuantity - 1, 0);

  return {
    id: sticker.id,
    code: sticker.code,
    title: sticker.title,
    sectionName: sticker.section.name,
    teamName: sticker.team?.name ?? null,
    group: sticker.group,
    type: sticker.type as StickerType,
    orderGlobal: sticker.orderGlobal,
    orderInTeam: sticker.orderInTeam,
    ownedQuantity,
    repeatedQuantity,
    status: ownedQuantity === 0 ? "Falta" : repeatedQuantity > 0 ? "Repetida" : "La tengo",
  };
}

export function calculateProgress(stickers: StickerView[]) {
  const total = stickers.length;
  const obtained = stickers.filter((sticker) => sticker.ownedQuantity > 0).length;
  const missing = total - obtained;
  const repeated = stickers.reduce((sum, sticker) => sum + sticker.repeatedQuantity, 0);
  const percent = total > 0 ? Math.round((obtained / total) * 100) : 0;

  return { total, obtained, missing, repeated, percent };
}

export async function getTemplateAlbum() {
  return prisma.album.findUniqueOrThrow({
    where: { slug: ALBUM_SLUG },
  });
}

export async function ensureUserStickerRows(userId: string) {
  const album = await getTemplateAlbum();
  const [stickers, existing] = await Promise.all([
    prisma.sticker.findMany({
      where: { albumId: album.id },
      select: { id: true },
    }),
    prisma.userSticker.findMany({
      where: { userId },
      select: { stickerId: true },
    }),
  ]);

  if (stickers.length === 0) return;

  const existingIds = new Set(existing.map((row) => row.stickerId));
  const missing = stickers.filter((sticker) => !existingIds.has(sticker.id));

  if (missing.length === 0) return;

  await prisma.userSticker.createMany({
    data: missing.map((sticker) => ({ userId, stickerId: sticker.id })),
  });
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
        [sticker.code, sticker.title, sticker.group ?? "", sticker.teamName ?? "", sticker.sectionName].join(" "),
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

export async function getGroupedAlbumForUser(
  userId: string,
  options?: { filter?: StickerFilter; query?: string },
): Promise<{ all: StickerView[]; filtered: StickerView[]; grouped: GroupedAlbum; progress: ReturnType<typeof calculateProgress> }> {
  await ensureUserStickerRows(userId);

  const album = await getTemplateAlbum();

  const sections = await prisma.section.findMany({
    where: { albumId: album.id },
    orderBy: { order: "asc" },
    include: {
      stickers: {
        include: {
          section: true,
          team: true,
          userStickers: {
            where: { userId },
            select: { ownedQuantity: true, repeatedQuantity: true },
          },
        },
        orderBy: [{ orderInSection: "asc" }, { orderGlobal: "asc" }],
      },
    },
  });

  const allViews: StickerView[] = [];
  for (const section of sections) {
    for (const sticker of section.stickers) {
      allViews.push(toStickerView(sticker, sticker.userStickers[0]));
    }
  }
  allViews.sort((a, b) => a.orderGlobal - b.orderGlobal);

  const filteredViews = applyStickerFilter(allViews, options);
  const filteredById = new Set(filteredViews.map((sticker) => sticker.id));

  let intro: SectionGroup | null = null;
  let fwcClosing: SectionGroup | null = null;
  const groupSections = new Map<string, { sectionId: string; teams: Map<string, TeamGroup> }>();

  for (const section of sections) {
    if (section.type === SECTION_TYPE.GROUP) {
      const teamsMap = new Map<string, TeamGroup>();
      for (const sticker of section.stickers) {
        if (!sticker.team) continue;
        const view = toStickerView(sticker, sticker.userStickers[0]);
        if (!filteredById.has(view.id)) continue;

        const existing = teamsMap.get(sticker.team.id);
        if (existing) {
          existing.stickers.push(view);
        } else {
          teamsMap.set(sticker.team.id, {
            id: sticker.team.id,
            name: sticker.team.name,
            group: sticker.team.group,
            countryCode: sticker.team.countryCode,
            stickers: [view],
            progress: calculateProgress([]),
          });
        }
      }

      for (const team of teamsMap.values()) {
        team.stickers.sort((a, b) => (a.orderInTeam ?? 0) - (b.orderInTeam ?? 0));
        const fullTeamStickers = section.stickers
          .filter((sticker) => sticker.team?.id === team.id)
          .map((sticker) => toStickerView(sticker, sticker.userStickers[0]));
        team.progress = calculateProgress(fullTeamStickers);
      }

      groupSections.set(section.group ?? "", { sectionId: section.id, teams: teamsMap });
      continue;
    }

    const stickerViews = section.stickers
      .map((sticker) => toStickerView(sticker, sticker.userStickers[0]))
      .filter((view) => filteredById.has(view.id));
    const fullSectionViews = section.stickers.map((sticker) => toStickerView(sticker, sticker.userStickers[0]));

    const sectionGroup: SectionGroup = {
      id: section.id,
      type: section.type as SectionType,
      name: section.name,
      group: section.group ?? "",
      order: section.order,
      stickers: stickerViews,
      progress: calculateProgress(fullSectionViews),
      teams: [],
    };

    if (section.type === SECTION_TYPE.INTRO) intro = sectionGroup;
    else if (section.type === SECTION_TYPE.FWC) fwcClosing = sectionGroup;
  }

  const groups: GroupedAlbum["groups"] = Array.from(groupSections.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, data]) => {
      const teams = Array.from(data.teams.values()).sort((a, b) => a.name.localeCompare(b.name));
      const groupStickers = teams.flatMap((team) => team.stickers);
      const fullGroupStickers = sections
        .find((section) => section.id === data.sectionId)
        ?.stickers.map((sticker) => toStickerView(sticker, sticker.userStickers[0])) ?? [];
      return {
        letter,
        teams,
        progress: calculateProgress(fullGroupStickers.length ? fullGroupStickers : groupStickers),
        sectionId: data.sectionId,
      };
    });

  const grouped: GroupedAlbum = {
    intro,
    groups,
    fwcClosing,
  };

  return {
    all: allViews,
    filtered: filteredViews,
    grouped,
    progress: calculateProgress(allViews),
  };
}

export async function getAlbumForUser(userId: string, options?: { filter?: StickerFilter; query?: string }) {
  await ensureUserStickerRows(userId);

  const query = options?.query?.trim();
  const userStickers = await prisma.userSticker.findMany({
    where: {
      userId,
      sticker: {
        album: { slug: ALBUM_SLUG },
        ...(query
          ? {
              OR: [
                { code: { contains: query } },
                { title: { contains: query } },
                { group: { contains: query } },
                { team: { name: { contains: query } } },
              ],
            }
          : {}),
      },
    },
    include: {
      sticker: {
        include: stickerWithStateInclude,
      },
    },
    orderBy: {
      sticker: {
        orderGlobal: "asc",
      },
    },
  });

  let stickers = userStickers.map((row) => toStickerView(row.sticker, row));

  if (options?.filter === "missing") {
    stickers = stickers.filter((sticker) => sticker.ownedQuantity === 0);
  } else if (options?.filter === "owned") {
    stickers = stickers.filter((sticker) => sticker.ownedQuantity > 0);
  } else if (options?.filter === "repeated") {
    stickers = stickers.filter((sticker) => sticker.repeatedQuantity > 0);
  } else if (options?.filter === "special") {
    stickers = stickers.filter((sticker) =>
      sticker.type === STICKER_TYPE.ESPECIAL ||
      sticker.type === STICKER_TYPE.ESTADIO ||
      sticker.type === STICKER_TYPE.CAMPEON,
    );
  }

  return {
    stickers,
    progress: calculateProgress(userStickers.map((row) => toStickerView(row.sticker, row))),
  };
}

export async function getGroupsForUser(userId: string) {
  await ensureUserStickerRows(userId);

  const teams = await prisma.team.findMany({
    include: {
      stickers: {
        include: {
          userStickers: {
            where: { userId },
            select: { ownedQuantity: true, repeatedQuantity: true },
          },
        },
        orderBy: { orderInTeam: "asc" },
      },
    },
    orderBy: [{ group: "asc" }, { order: "asc" }],
  });

  return teams.map((team) => {
    const stickerViews = team.stickers.map((sticker) =>
      toStickerView(
        {
          ...sticker,
          section: { id: "", albumId: "", name: `Grupo ${team.group}`, type: SECTION_TYPE.GROUP, order: 0, group: team.group },
          team,
        },
        sticker.userStickers[0],
      ),
    );

    return {
      id: team.id,
      name: team.name,
      group: team.group,
      countryCode: team.countryCode,
      progress: calculateProgress(stickerViews),
    };
  });
}

export async function getTeamAlbum(userId: string, countryCode: string) {
  await ensureUserStickerRows(userId);

  const team = await prisma.team.findUniqueOrThrow({
    where: { countryCode },
    include: {
      stickers: {
        include: {
          section: true,
          team: true,
          userStickers: {
            where: { userId },
            select: { ownedQuantity: true, repeatedQuantity: true },
          },
        },
        orderBy: { orderInTeam: "asc" },
      },
    },
  });

  const stickers = team.stickers.map((sticker) => toStickerView(sticker, sticker.userStickers[0]));

  return {
    team,
    stickers,
    progress: calculateProgress(stickers),
  };
}

export async function getPublicAlbum(publicSlug: string) {
  const owner = await prisma.user.findUnique({
    where: { publicSlug },
    select: { id: true, name: true, publicSlug: true },
  });

  if (!owner) return null;

  const album = await getAlbumForUser(owner.id);

  return { owner, ...album };
}

export type CompareResult = {
  me: { id: string; name: string; publicSlug: string };
  other: { id: string; name: string; publicSlug: string };
  iNeed: StickerView[];
  theyNeed: StickerView[];
  suggested: { receive: StickerView; give: StickerView }[];
  myProgress: ReturnType<typeof calculateProgress>;
  otherProgress: ReturnType<typeof calculateProgress>;
};

export async function compareAlbums(myUserId: string, otherSlug: string): Promise<CompareResult | null> {
  const [me, other] = await Promise.all([
    prisma.user.findUnique({
      where: { id: myUserId },
      select: { id: true, name: true, publicSlug: true },
    }),
    prisma.user.findUnique({
      where: { publicSlug: otherSlug },
      select: { id: true, name: true, publicSlug: true },
    }),
  ]);

  if (!me || !other) return null;

  const [mine, theirs] = await Promise.all([getAlbumForUser(myUserId), getAlbumForUser(other.id)]);
  const mineById = new Map(mine.stickers.map((sticker) => [sticker.id, sticker]));
  const theirsById = new Map(theirs.stickers.map((sticker) => [sticker.id, sticker]));

  const iNeed = theirs.stickers.filter((otherSticker) => {
    const mySticker = mineById.get(otherSticker.id);
    return mySticker?.ownedQuantity === 0 && otherSticker.repeatedQuantity > 0;
  });

  const theyNeed = mine.stickers.filter((mySticker) => {
    const otherSticker = theirsById.get(mySticker.id);
    return otherSticker?.ownedQuantity === 0 && mySticker.repeatedQuantity > 0;
  });

  const suggested = iNeed.slice(0, Math.min(iNeed.length, theyNeed.length)).map((receive, index) => ({
    receive,
    give: theyNeed[index],
  }));

  return {
    me,
    other,
    iNeed,
    theyNeed,
    suggested,
    myProgress: mine.progress,
    otherProgress: theirs.progress,
  };
}

export type PublicAlbumFilter = "all" | "missing" | "owned" | "repeated";

export type PublicAlbumOptions = {
  filter?: PublicAlbumFilter;
  group?: string;
  team?: string;
};

export type PublicAlbumGroupOption = { letter: string; teams: { countryCode: string; name: string }[] };

export function applyPublicAlbumFilters(stickers: StickerView[], options?: PublicAlbumOptions) {
  let filtered = stickers;

  if (options?.group) {
    filtered = filtered.filter((sticker) => (sticker.group ?? "") === options.group);
  }
  if (options?.team) {
    filtered = filtered.filter((sticker) => (sticker.teamName ?? "") === options.team);
  }
  if (options?.filter === "missing") {
    filtered = filtered.filter((sticker) => sticker.ownedQuantity === 0);
  } else if (options?.filter === "owned") {
    filtered = filtered.filter((sticker) => sticker.ownedQuantity > 0);
  } else if (options?.filter === "repeated") {
    filtered = filtered.filter((sticker) => sticker.repeatedQuantity > 0);
  }

  return filtered;
}

export function getPublicAlbumGroupOptions(stickers: StickerView[]): PublicAlbumGroupOption[] {
  const map = new Map<string, Map<string, string>>();
  for (const sticker of stickers) {
    if (!sticker.group) continue;
    const teamName = sticker.teamName ?? "";
    if (!teamName) continue;
    const teams = map.get(sticker.group) ?? new Map<string, string>();
    if (!teams.has(teamName)) teams.set(teamName, teamName);
    map.set(sticker.group, teams);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, teams]) => ({
      letter,
      teams: Array.from(teams.entries())
        .map(([name]) => ({ countryCode: name, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function exportLines(stickers: StickerView[]) {
  return stickers.map((sticker) =>
    [sticker.code, sticker.teamName, sticker.title.replace(`${sticker.teamName ?? ""} - `, "")]
      .filter(Boolean)
      .join(" - "),
  );
}

export function exportCsv(stickers: StickerView[]) {
  const rows = [["codigo", "nombre", "seccion", "grupo", "seleccion", "cantidad_repetida"]];
  for (const sticker of stickers) {
    rows.push([
      sticker.code,
      sticker.title,
      sticker.sectionName,
      sticker.group ?? "",
      sticker.teamName ?? "",
      String(sticker.repeatedQuantity),
    ]);
  }

  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}
