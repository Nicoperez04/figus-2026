import { ExportTools } from "@/components/export-tools";
import { Button, Input } from "@/components/ui";
import { resetAlbumAction, updateProfileAction } from "@/lib/actions";
import { getAlbumForUser } from "@/lib/album";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const album = await getAlbumForUser(user.id);
  const missing = album.stickers.filter((sticker) => sticker.ownedQuantity === 0);
  const repeated = album.stickers.filter((sticker) => sticker.repeatedQuantity > 0);
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/u/${user.publicSlug}/album`;

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Configuración</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Tu cuenta y exportaciones</h1>
      </header>

      {params.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {params.error}
        </p>
      ) : null}
      {params.ok ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {params.ok}
        </p>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Perfil público</h2>
        <p className="mt-0.5 text-sm text-slate-500">El nombre y slug se usan en tu link compartible.</p>
        <form action={updateProfileAction} className="mt-4 grid gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nombre público</span>
            <div className="mt-1.5">
              <Input defaultValue={user.name} name="name" />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Slug público</span>
            <div className="mt-1.5">
              <Input defaultValue={user.publicSlug} name="publicSlug" />
            </div>
          </label>
          <div>
            <Button type="submit" variant="primary" size="md">
              Guardar cambios
            </Button>
          </div>
        </form>
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Link público</p>
          <p className="mt-0.5 break-all font-mono text-xs text-slate-700">{publicUrl}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">Exportar listas</h2>
        <p className="mt-0.5 text-sm text-slate-500">Copiá faltantes, repetidas o descargá un CSV.</p>
        <div className="mt-4">
          <ExportTools missing={missing} repeated={repeated} />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-5">
        <h2 className="text-base font-semibold text-red-700">Resetear álbum</h2>
        <p className="mt-0.5 text-sm text-slate-500">Vuelve todas tus figuritas al estado &quot;faltan&quot;.</p>
        <form action={resetAlbumAction} className="mt-4">
          <Button type="submit" variant="danger" size="md">
            Resetear álbum
          </Button>
        </form>
      </section>
    </main>
  );
}
