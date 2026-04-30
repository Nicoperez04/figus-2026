import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressSummary } from "@/components/progress-summary";
import { PublicAlbumFilters } from "@/components/public-album-filters";
import { StickerCard } from "@/components/sticker-card";
import { Chip, LinkButton } from "@/components/ui";
import { addFriendAction, removeFriendAction } from "@/lib/actions";
import {
  applyPublicAlbumFilters,
  getPublicAlbum,
  getPublicAlbumGroupOptions,
  type PublicAlbumFilter,
} from "@/lib/album";
import { getCurrentUser } from "@/lib/auth";
import { isFriend } from "@/lib/friends";

const allowedFilters: PublicAlbumFilter[] = ["all", "missing", "owned", "repeated"];

export default async function PublicAlbumPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ filter?: string; group?: string; team?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const [album, currentUser] = await Promise.all([getPublicAlbum(slug), getCurrentUser()]);

  if (!album) notFound();

  const filter = allowedFilters.includes(sp.filter as PublicAlbumFilter)
    ? (sp.filter as PublicAlbumFilter)
    : "all";
  const group = sp.group?.trim() ?? "";
  const team = sp.team?.trim() ?? "";

  const groupOptions = getPublicAlbumGroupOptions(album.stickers);
  const visible = applyPublicAlbumFilters(album.stickers, { filter, group, team });

  const totals = {
    all: album.stickers.length,
    missing: album.stickers.filter((sticker) => sticker.ownedQuantity === 0).length,
    owned: album.stickers.filter((sticker) => sticker.ownedQuantity > 0).length,
    repeated: album.stickers.filter((sticker) => sticker.repeatedQuantity > 0).length,
  };

  const isOwnAlbum = currentUser?.publicSlug === album.owner.publicSlug;
  const friendStatus = currentUser && !isOwnAlbum ? await isFriend(currentUser.id, album.owner.id) : false;

  const basePath = `/u/${album.owner.publicSlug}/album`;
  const compareHref = currentUser
    ? `/u/${album.owner.publicSlug}/comparar`
    : `/login?next=${encodeURIComponent(`/u/${album.owner.publicSlug}/comparar`)}`;

  return (
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Álbum público</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {album.owner.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Solo lectura: podés ver progreso, repetidas y faltantes para coordinar un cambio.
            </p>
          </div>

          {!isOwnAlbum ? (
            <div className="flex flex-wrap gap-2">
              <LinkButton href={compareHref} variant="primary" size="md">
                Comparar con mi álbum
              </LinkButton>
              {currentUser ? (
                friendStatus ? (
                  <form action={removeFriendAction}>
                    <input type="hidden" name="friendSlug" value={album.owner.publicSlug} />
                    <input type="hidden" name="redirectTo" value={basePath} />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5 text-[13px] font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      ✓ Guardado en amigos
                    </button>
                  </form>
                ) : (
                  <form action={addFriendAction}>
                    <input type="hidden" name="friendSlug" value={album.owner.publicSlug} />
                    <input type="hidden" name="redirectTo" value={basePath} />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      + Guardar como amigo
                    </button>
                  </form>
                )
              ) : (
                <Link
                  href={`/login?next=${encodeURIComponent(basePath)}`}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Iniciá sesión para guardar
                </Link>
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
              Estás viendo tu propio álbum público. Compartí este link con tus amigos.
            </p>
          )}
        </div>
      </section>

      <ProgressSummary stickers={album.stickers} />

      <PublicAlbumFilters
        basePath={basePath}
        current={filter}
        group={group}
        team={team}
        groupOptions={groupOptions}
        totals={totals}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">
            Figuritas
            <span className="ml-2 text-sm font-medium text-slate-500">({visible.length})</span>
          </h2>
          {filter !== "all" || group || team ? (
            <Chip tone="emerald">Filtrado</Chip>
          ) : null}
        </header>

        {visible.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
            No hay figuritas para esos filtros.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} editable={false} compact showMeta />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
