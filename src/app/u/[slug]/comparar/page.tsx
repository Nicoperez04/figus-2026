import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExchangeTools } from "@/components/exchange-tools";
import { AppNav } from "@/components/nav";
import { StickerCard } from "@/components/sticker-card";
import { Chip, LinkButton, ProgressBar } from "@/components/ui";
import { addFriendAction } from "@/lib/actions";
import { compareAlbums, type StickerView } from "@/lib/album";
import { getCurrentUser } from "@/lib/auth";
import { isFriend } from "@/lib/friends";

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?next=${encodeURIComponent(`/u/${slug}/comparar`)}`);
  }

  const comparison = await compareAlbums(currentUser.id, slug);
  if (!comparison) notFound();

  const isOwnAlbum = comparison.me.publicSlug === comparison.other.publicSlug;
  if (isOwnAlbum) {
    redirect("/mi-album");
  }

  const friendStatus = await isFriend(currentUser.id, comparison.other.id);

  return (
    <div className="min-h-screen">
      <AppNav user={currentUser} />
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Comparador</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Intercambio con {comparison.other.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Comparamos tu álbum con el de {comparison.other.name} para encontrar coincidencias.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href={`/u/${comparison.other.publicSlug}/album`} variant="secondary" size="md">
              Ver su álbum
            </LinkButton>
            {!friendStatus ? (
              <form action={addFriendAction}>
                <input type="hidden" name="friendSlug" value={comparison.other.publicSlug} />
                <input type="hidden" name="redirectTo" value={`/u/${comparison.other.publicSlug}/comparar`} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  + Guardar como amigo
                </button>
              </form>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3.5 text-[13px] font-medium text-emerald-700">
                ✓ Amigo guardado
              </span>
            )}
          </div>
        </header>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
          <UserProgress label={`Vos · ${comparison.me.name}`} progress={comparison.myProgress} />
          <UserProgress label={comparison.other.name} progress={comparison.otherProgress} />
        </section>

        <section className="rounded-2xl border border-emerald-200/70 bg-emerald-700 p-5 text-white sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Intercambio sugerido</h2>
              <p className="mt-1 text-sm text-emerald-50/90">
                Pares 1 a 1 entre lo que vos necesitás y lo que tenés repetido.
              </p>
            </div>
            <Chip tone="amber" className="!bg-amber-300 !text-amber-900 !ring-amber-400/40">
              {comparison.suggested.length} {comparison.suggested.length === 1 ? "par" : "pares"}
            </Chip>
          </div>
          <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
            {comparison.suggested.map((pair) => (
              <article
                key={`${pair.receive.id}-${pair.give.id}`}
                className="rounded-xl bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                  Recibís de {comparison.other.name}
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {pair.receive.code} · {pair.receive.teamName ?? pair.receive.sectionName} · {pair.receive.title}
                </p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-emerald-100">
                  Le das
                </p>
                <p className="mt-0.5 text-sm font-semibold text-emerald-50">
                  {pair.give.code} · {pair.give.teamName ?? pair.give.sectionName} · {pair.give.title}
                </p>
              </article>
            ))}
          </div>
          {comparison.suggested.length === 0 ? (
            <p className="mt-4 rounded-xl bg-white/10 p-4 text-sm font-medium text-emerald-50">
              Todavía no hay un intercambio directo sugerido.
            </p>
          ) : null}
        </section>

        <ExchangeTools comparison={comparison} />

        <section className="grid gap-4 lg:grid-cols-2">
          <CompareList
            title="Figuritas que me sirven"
            description={`Las que vos no tenés y ${comparison.other.name} tiene repetidas.`}
            stickers={comparison.iNeed}
            tone="emerald"
          />
          <CompareList
            title={`Figuritas que le sirven a ${comparison.other.name}`}
            description="Las que vos tenés repetidas y le faltan."
            stickers={comparison.theyNeed}
            tone="amber"
          />
        </section>

        <p className="text-center text-xs text-slate-500">
          ¿No es la persona indicada?{" "}
          <Link href="/amigos" className="font-semibold text-emerald-700 hover:underline">
            Volver a amigos
          </Link>
        </p>
      </main>
    </div>
  );
}

function UserProgress({
  label,
  progress,
}: {
  label: string;
  progress: { obtained: number; total: number; percent: number; repeated: number; missing: number };
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-base font-bold tabular-nums text-slate-900">
        {progress.obtained}
        <span className="text-slate-400"> / {progress.total}</span>
        <span className="ml-2 text-sm font-semibold text-emerald-700">{progress.percent}%</span>
      </p>
      <div className="mt-2">
        <ProgressBar percent={progress.percent} height="xs" />
      </div>
      <p className="mt-2 text-[11px] font-medium text-slate-500">
        Repetidas: <span className="font-bold tabular-nums text-amber-700">{progress.repeated}</span> · Faltan:{" "}
        <span className="font-bold tabular-nums text-slate-700">{progress.missing}</span>
      </p>
    </div>
  );
}

function CompareList({
  title,
  description,
  stickers,
  tone,
}: {
  title: string;
  description: string;
  stickers: StickerView[];
  tone: "emerald" | "amber";
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <Chip tone={tone}>{stickers.length}</Chip>
      </header>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {stickers.map((sticker) => (
          <StickerCard
            key={sticker.id}
            editable={false}
            sticker={sticker}
            compact
            showMeta
            highlightRepeated={tone === "amber"}
          />
        ))}
      </div>
      {stickers.length === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
          Sin coincidencias por ahora.
        </p>
      ) : null}
    </section>
  );
}
