import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * Carpeta desde la que ejecutás los comandos (pnpm/npm run prisma:*).
 * No usar `import.meta.url` para ubicar `.env`: Prisma puede ejecutar este archivo
 * desde una ruta temporal y cargaría el `.env` equivocado.
 */
const projectRoot = process.cwd();

config({ path: path.join(projectRoot, ".env"), override: true });
config({ path: path.join(projectRoot, ".env.local"), override: true });

/** Parser mínimo de `.env`: evita perder DATABASE_URL si el sistema tiene otra o dotenv falla. */
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function normalizeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  return t;
}

const fromFiles = {
  ...parseEnvFile(path.join(projectRoot, ".env")),
  ...parseEnvFile(path.join(projectRoot, ".env.local")),
};

const databaseUrl = normalizeUrl(fromFiles.DATABASE_URL) ?? normalizeUrl(process.env.DATABASE_URL);

if (!databaseUrl?.startsWith("postgresql://") && !databaseUrl?.startsWith("postgres://")) {
  throw new Error(
    [
      "DATABASE_URL debe empezar con postgresql:// o postgres://.",
      `Carpeta actual: ${projectRoot}`,
      "Comprobá que .env (o .env.local) tenga la URL de Neon guardada en disco.",
      "Si en Windows tenés DATABASE_URL=file:./dev.db como variable de usuario/sistema, borrala o usá solo el archivo .env.",
    ].join(" "),
  );
}

process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
