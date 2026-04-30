export const SECTION_TYPE = {
  INTRO: "INTRO",
  GROUP: "GROUP",
  /** FWC 9–19 al cierre del álbum (tras las selecciones). */
  FWC: "FWC",
} as const;

export type SectionType = (typeof SECTION_TYPE)[keyof typeof SECTION_TYPE];

export const STICKER_TYPE = {
  NORMAL: "NORMAL",
  ESCUDO: "ESCUDO",
  EQUIPO: "EQUIPO",
  JUGADOR: "JUGADOR",
  ESTADIO: "ESTADIO",
  CAMPEON: "CAMPEON",
  ESPECIAL: "ESPECIAL",
} as const;

export type StickerType = (typeof STICKER_TYPE)[keyof typeof STICKER_TYPE];
