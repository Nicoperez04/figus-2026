import { AlbumOutline } from "@/components/album-outline";
import { MiAlbumBody } from "@/components/mi-album-body";
import { ProgressSummary } from "@/components/progress-summary";
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
  const initialQuery = params.q ?? "";
  const album = await getGroupedAlbumForUser(user.id, { filter });

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-emerald-700">Hola, {user.name}</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mi álbum</h1>
        <p className="text-sm text-slate-500">Organizado por secciones especiales y los doce grupos del Mundial.</p>
      </header>

      <ProgressSummary stickers={album.all} />

      <AlbumOutline grouped={album.grouped} />

      <MiAlbumBody grouped={album.grouped} allStickers={album.all} filter={filter} initialQuery={initialQuery} />
    </main>
  );
}
