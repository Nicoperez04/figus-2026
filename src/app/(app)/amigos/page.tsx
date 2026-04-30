import { Chip, LinkButton, ProgressBar } from "@/components/ui";
import { removeFriendAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getFriendsForUser } from "@/lib/friends";

export default async function FriendsPage() {
  const user = await requireUser();
  const friends = await getFriendsForUser(user.id);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Amigos</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Coleccionistas guardados
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Encontrá rápido a tus amigos para comparar y proponer intercambios.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tu link público</p>
          <p className="mt-0.5 break-all font-mono text-xs text-slate-700">
            /u/{user.publicSlug}/album
          </p>
        </div>
      </header>

      {friends.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <UsersIcon />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">Todavía no guardaste amigos</p>
          <p className="mt-1 text-xs text-slate-500">
            Cuando entres al álbum público de alguien, tocá &quot;Guardar como amigo&quot; para tenerlo acá.
          </p>
        </section>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <article
              key={friend.friendshipId}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 sm:p-5"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-900">{friend.user.name}</h2>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                    /u/{friend.user.publicSlug}/album
                  </p>
                </div>
                <Chip tone="emerald">
                  <span className="font-bold tabular-nums">{friend.progress.percent}%</span>
                </Chip>
              </header>
              <div className="mt-3">
                <ProgressBar percent={friend.progress.percent} />
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                <Stat label="Tiene" value={friend.progress.obtained} />
                <Stat label="Faltan" value={friend.progress.missing} />
                <Stat label="Repetidas" value={friend.repeatedCount} tone="amber" />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <LinkButton
                  href={`/u/${friend.user.publicSlug}/album`}
                  variant="secondary"
                  size="sm"
                >
                  Ver álbum
                </LinkButton>
                <LinkButton
                  href={`/u/${friend.user.publicSlug}/comparar`}
                  variant="primary"
                  size="sm"
                >
                  Comparar
                </LinkButton>
                <form action={removeFriendAction} className="ml-auto">
                  <input type="hidden" name="friendSlug" value={friend.user.publicSlug} />
                  <input type="hidden" name="redirectTo" value="/amigos" />
                  <button
                    type="submit"
                    className="inline-flex h-7 items-center justify-center rounded-md px-2.5 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    Quitar
                  </button>
                </form>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "amber";
}) {
  const toneClass =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <div className={`rounded-lg border px-2 py-1.5 ${toneClass}`}>
      <p className="text-[15px] font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm6 9a8 8 0 1 0-16 0"
      />
    </svg>
  );
}
