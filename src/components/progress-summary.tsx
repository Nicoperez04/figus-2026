import { ProgressBar } from "@/components/ui";
import { calculateProgress, type StickerView } from "@/lib/album";

export function ProgressSummary({ stickers }: { stickers: StickerView[] }) {
  const progress = calculateProgress(stickers);

  return (
    <section className="rounded-2xl border border-emerald-200/70 bg-emerald-700 p-5 text-white sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/90">Progreso total</p>
          <h2 className="mt-1.5 text-2xl font-bold tabular-nums sm:text-3xl">
            {progress.obtained}
            <span className="text-emerald-200/80"> / {progress.total}</span>
          </h2>
          <p className="mt-1 text-sm text-emerald-50/90">{progress.percent}% del álbum completo</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center lg:min-w-80">
          <Metric label="Faltan" value={progress.missing} />
          <Metric label="Repetidas" value={progress.repeated} />
          <Metric label="Completado" value={`${progress.percent}%`} />
        </div>
      </div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-emerald-300 transition-[width] duration-500" style={{ width: `${progress.percent}%` }} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-50/90">{label}</p>
    </div>
  );
}

export { ProgressBar };
