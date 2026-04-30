export const ALBUM_SLUG = "mundial-2026";
export const ALBUM_NAME = "Álbum Panini Mundial 2026";
export const ALBUM_YEAR = 2026;

/** Tras la figurita 00: FWC 1 a FWC 8. */
export const FWC_INTRO_STICKERS = 8;
/** Al final del álbum: FWC 9 a FWC 19 (11 figuritas). */
export const FWC_TAIL_START = 9;
export const FWC_TAIL_END = 19;

/** 20 por selección: 1 escudo, 11 jugadores (2–12), formación (13), 7 jugadores (14–20). */
export const TEAM_STICKER_TITLES = [
  "Escudo",
  "Jugador 1",
  "Jugador 2",
  "Jugador 3",
  "Jugador 4",
  "Jugador 5",
  "Jugador 6",
  "Jugador 7",
  "Jugador 8",
  "Jugador 9",
  "Jugador 10",
  "Jugador 11",
  "Formación",
  "Jugador 12",
  "Jugador 13",
  "Jugador 14",
  "Jugador 15",
  "Jugador 16",
  "Jugador 17",
  "Jugador 18",
] as const;

export type TeamSeed = {
  group: string;
  name: string;
  countryCode: string;
};

export const GROUPS: { group: string; teams: TeamSeed[] }[] = [
  {
    group: "A",
    teams: [
      { name: "México", countryCode: "MEX", group: "A" },
      { name: "Sudáfrica", countryCode: "RSA", group: "A" },
      { name: "Corea del Sur", countryCode: "KOR", group: "A" },
      { name: "República Checa", countryCode: "CZE", group: "A" },
    ],
  },
  {
    group: "B",
    teams: [
      { name: "Canadá", countryCode: "CAN", group: "B" },
      { name: "Bosnia y Herzegovina", countryCode: "BIH", group: "B" },
      { name: "Qatar", countryCode: "QAT", group: "B" },
      { name: "Suiza", countryCode: "SUI", group: "B" },
    ],
  },
  {
    group: "C",
    teams: [
      { name: "Brasil", countryCode: "BRA", group: "C" },
      { name: "Marruecos", countryCode: "MAR", group: "C" },
      { name: "Haití", countryCode: "HAI", group: "C" },
      { name: "Escocia", countryCode: "SCO", group: "C" },
    ],
  },
  {
    group: "D",
    teams: [
      { name: "Estados Unidos", countryCode: "USA", group: "D" },
      { name: "Paraguay", countryCode: "PAR", group: "D" },
      { name: "Australia", countryCode: "AUS", group: "D" },
      { name: "Turquía", countryCode: "TUR", group: "D" },
    ],
  },
  {
    group: "E",
    teams: [
      { name: "Alemania", countryCode: "GER", group: "E" },
      { name: "Curazao", countryCode: "CUW", group: "E" },
      { name: "Costa de Marfil", countryCode: "CIV", group: "E" },
      { name: "Ecuador", countryCode: "ECU", group: "E" },
    ],
  },
  {
    group: "F",
    teams: [
      { name: "Países Bajos", countryCode: "NED", group: "F" },
      { name: "Japón", countryCode: "JPN", group: "F" },
      { name: "Suecia", countryCode: "SWE", group: "F" },
      { name: "Túnez", countryCode: "TUN", group: "F" },
    ],
  },
  {
    group: "G",
    teams: [
      { name: "Bélgica", countryCode: "BEL", group: "G" },
      { name: "Egipto", countryCode: "EGY", group: "G" },
      { name: "Irán", countryCode: "IRN", group: "G" },
      { name: "Nueva Zelanda", countryCode: "NZL", group: "G" },
    ],
  },
  {
    group: "H",
    teams: [
      { name: "España", countryCode: "ESP", group: "H" },
      { name: "Cabo Verde", countryCode: "CPV", group: "H" },
      { name: "Arabia Saudita", countryCode: "KSA", group: "H" },
      { name: "Uruguay", countryCode: "URU", group: "H" },
    ],
  },
  {
    group: "I",
    teams: [
      { name: "Francia", countryCode: "FRA", group: "I" },
      { name: "Senegal", countryCode: "SEN", group: "I" },
      { name: "Irak", countryCode: "IRQ", group: "I" },
      { name: "Noruega", countryCode: "NOR", group: "I" },
    ],
  },
  {
    group: "J",
    teams: [
      { name: "Argentina", countryCode: "ARG", group: "J" },
      { name: "Argelia", countryCode: "ALG", group: "J" },
      { name: "Austria", countryCode: "AUT", group: "J" },
      { name: "Jordania", countryCode: "JOR", group: "J" },
    ],
  },
  {
    group: "K",
    teams: [
      { name: "Portugal", countryCode: "POR", group: "K" },
      { name: "República Democrática del Congo", countryCode: "COD", group: "K" },
      { name: "Uzbekistán", countryCode: "UZB", group: "K" },
      { name: "Colombia", countryCode: "COL", group: "K" },
    ],
  },
  {
    group: "L",
    teams: [
      { name: "Inglaterra", countryCode: "ENG", group: "L" },
      { name: "Croacia", countryCode: "CRO", group: "L" },
      { name: "Ghana", countryCode: "GHA", group: "L" },
      { name: "Panamá", countryCode: "PAN", group: "L" },
    ],
  },
];
