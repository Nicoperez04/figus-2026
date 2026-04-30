import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ALBUM_NAME,
  ALBUM_SLUG,
  ALBUM_YEAR,
  FWC_INTRO_STICKERS,
  FWC_TAIL_END,
  FWC_TAIL_START,
  GROUPS,
  TEAM_STICKER_TITLES,
} from "../src/lib/album-template";
import { SECTION_TYPE, STICKER_TYPE } from "../src/lib/album-types";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está definida");
}
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

const pad = (value: number, size = 2) => value.toString().padStart(size, "0");
const padThree = (value: number) => value.toString().padStart(3, "0");

async function main() {
  const album = await prisma.album.upsert({
    where: { slug: ALBUM_SLUG },
    create: {
      slug: ALBUM_SLUG,
      name: ALBUM_NAME,
      description: "Template público para gestionar figuritas del Mundial 2026.",
      year: ALBUM_YEAR,
      isTemplate: true,
    },
    update: {
      name: ALBUM_NAME,
      description: "Template público para gestionar figuritas del Mundial 2026.",
      year: ALBUM_YEAR,
      isTemplate: true,
    },
  });

  await prisma.sticker.deleteMany({
    where: {
      albumId: album.id,
      OR: [{ code: { startsWith: "STADIUM-" } }, { code: { startsWith: "CHAMPION-" } }],
    },
  });
  await prisma.section.deleteMany({
    where: {
      albumId: album.id,
      type: { in: ["STADIUMS", "CHAMPIONS"] },
    },
  });

  let sectionOrder = 1;
  let orderGlobal = 1;

  const introSection = await prisma.section.upsert({
    where: { albumId_type_group: { albumId: album.id, type: SECTION_TYPE.INTRO, group: "INTRO" } },
    create: {
      albumId: album.id,
      name: "Inicio del álbum",
      type: SECTION_TYPE.INTRO,
      group: "INTRO",
      order: sectionOrder++,
    },
    update: { name: "Inicio del álbum", order: sectionOrder++ },
  });

  const obsoleteIntroCodes = Array.from({ length: 8 }, (_, i) => `INTRO-${padThree(i + 1)}`);
  await prisma.sticker.deleteMany({
    where: { albumId: album.id, code: { in: obsoleteIntroCodes } },
  });

  const upsertIntroSticker = async (input: {
    code: string;
    title: string;
    description: string;
    orderInSection: number;
  }) => {
    const og = orderGlobal;
    await prisma.sticker.upsert({
      where: { code: input.code },
      create: {
        albumId: album.id,
        sectionId: introSection.id,
        code: input.code,
        number: og,
        title: input.title,
        description: input.description,
        type: STICKER_TYPE.ESPECIAL,
        orderGlobal: og,
        orderInSection: input.orderInSection,
      },
      update: {
        sectionId: introSection.id,
        title: input.title,
        description: input.description,
        type: STICKER_TYPE.ESPECIAL,
        orderGlobal: og,
        orderInSection: input.orderInSection,
      },
    });
    orderGlobal++;
  };

  await upsertIntroSticker({
    code: "INTRO-000",
    title: "00",
    description: "Primera figurita del álbum (número 00).",
    orderInSection: 1,
  });

  for (let i = 1; i <= FWC_INTRO_STICKERS; i++) {
    await upsertIntroSticker({
      code: `FWC-${pad(i)}`,
      title: `FWC ${i}`,
      description: "Figurita FIFA World Cup™ — bloque inicial (tras el 00).",
      orderInSection: 1 + i,
    });
  }

  for (const groupSeed of GROUPS) {
    const groupSection = await prisma.section.upsert({
      where: { albumId_type_group: { albumId: album.id, type: SECTION_TYPE.GROUP, group: groupSeed.group } },
      create: {
        albumId: album.id,
        name: `Grupo ${groupSeed.group}`,
        type: SECTION_TYPE.GROUP,
        group: groupSeed.group,
        order: sectionOrder++,
      },
      update: { name: `Grupo ${groupSeed.group}`, order: sectionOrder++ },
    });

    let orderInSection = 1;

    for (const [teamIndex, teamSeed] of groupSeed.teams.entries()) {
      const team = await prisma.team.upsert({
        where: { countryCode: teamSeed.countryCode },
        create: {
          group: teamSeed.group,
          name: teamSeed.name,
          countryCode: teamSeed.countryCode,
          order: teamIndex + 1,
        },
        update: {
          group: teamSeed.group,
          name: teamSeed.name,
          order: teamIndex + 1,
        },
      });

      for (const [stickerIndex, baseTitle] of TEAM_STICKER_TITLES.entries()) {
        const orderInTeam = stickerIndex + 1;
        const code = `${team.countryCode}-${pad(orderInTeam)}`;
        const type =
          orderInTeam === 1
            ? STICKER_TYPE.ESCUDO
            : orderInTeam === 13
              ? STICKER_TYPE.EQUIPO
              : STICKER_TYPE.JUGADOR;

        await prisma.sticker.upsert({
          where: { code },
          create: {
            albumId: album.id,
            sectionId: groupSection.id,
            teamId: team.id,
            group: team.group,
            code,
            number: orderGlobal,
            title: `${team.name} - ${baseTitle}`,
            type,
            orderGlobal: orderGlobal++,
            orderInSection: orderInSection++,
            orderInTeam,
          },
          update: {
            sectionId: groupSection.id,
            teamId: team.id,
            group: team.group,
            title: `${team.name} - ${baseTitle}`,
            type,
            orderGlobal: orderGlobal++,
            orderInSection: orderInSection++,
            orderInTeam,
          },
        });
      }
    }
  }

  const fwcClosingSection = await prisma.section.upsert({
    where: { albumId_type_group: { albumId: album.id, type: SECTION_TYPE.FWC, group: "FWC" } },
    create: {
      albumId: album.id,
      name: "FIFA World Cup™ (cierre)",
      type: SECTION_TYPE.FWC,
      group: "FWC",
      order: sectionOrder++,
    },
    update: { name: "FIFA World Cup™ (cierre)", order: sectionOrder++ },
  });

  for (let i = FWC_TAIL_START; i <= FWC_TAIL_END; i++) {
    const code = `FWC-${pad(i)}`;
    const og = orderGlobal;
    const orderInFwcSection = i - FWC_TAIL_START + 1;
    await prisma.sticker.upsert({
      where: { code },
      create: {
        albumId: album.id,
        sectionId: fwcClosingSection.id,
        code,
        number: og,
        title: `FWC ${i}`,
        description: "Figurita FIFA World Cup™ — cierre del álbum.",
        type: STICKER_TYPE.ESPECIAL,
        orderGlobal: og,
        orderInSection: orderInFwcSection,
      },
      update: {
        sectionId: fwcClosingSection.id,
        title: `FWC ${i}`,
        description: "Figurita FIFA World Cup™ — cierre del álbum.",
        type: STICKER_TYPE.ESPECIAL,
        orderGlobal: og,
        orderInSection: orderInFwcSection,
      },
    });
    orderGlobal++;
  }

  const [teams, stickers] = await Promise.all([
    prisma.team.count(),
    prisma.sticker.count({ where: { albumId: album.id } }),
  ]);

  console.log(`Seed completo: ${teams} selecciones y ${stickers} figuritas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
