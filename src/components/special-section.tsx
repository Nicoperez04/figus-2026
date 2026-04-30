import { StickerCard } from "@/components/sticker-card";
import { Chip, ProgressBar } from "@/components/ui";
import type { SectionGroup } from "@/lib/album";

type Tone = "amber" | "violet" | "sky";

type Props = {
  anchorId: string;
  emoji: string;
  accent: Tone;
  subtitle: string;
  section: SectionGroup;
};

const accentMap: Record<Tone, { iconBg: string; iconText: string; chip: "amber" | "violet" | "sky" }> = {
  amber: { iconBg: "bg-amber-100", iconText: "text-amber-700", chip: "amber" },
  violet: { iconBg: "bg-violet-100", iconText: "text-violet-700", chip: "violet" },
  sky: { iconBg: "bg-sky-100", iconText: "text-sky-700", chip: "sky" },
};

export function SpecialSection({ anchorId, emoji, accent, subtitle, section }: Props) {
  const styles = accentMap[accent];

  return (
    <section id={anchorId} className="scroll-mt-32">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg} text-xl ${styles.iconText}`}
              aria-hidden
            >
              {emoji}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{subtitle}</p>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{section.name}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone={styles.chip}>
              <span className="font-bold tabular-nums">
                {section.progress.obtained}/{section.progress.total}
              </span>
            </Chip>
            <Chip tone={styles.chip}>
              <span className="font-bold tabular-nums">{section.progress.percent}%</span>
            </Chip>
            {section.progress.repeated > 0 ? <Chip tone="amber">{section.progress.repeated} rep</Chip> : null}
          </div>
        </header>
        <div className="mt-4">
          <ProgressBar percent={section.progress.percent} tone={accent} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {section.stickers.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} compact />
          ))}
        </div>
        {section.stickers.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-sm font-medium text-slate-500">
            No hay figuritas que cumplan los filtros en esta sección.
          </p>
        ) : null}
      </div>
    </section>
  );
}
