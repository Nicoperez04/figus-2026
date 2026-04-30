import type { GroupedAlbum } from "@/lib/album";

type Props = {
  grouped: GroupedAlbum;
};

export function AlbumOutline({ grouped }: Props) {
  const items: { id: string; label: string; percent: number }[] = [];

  if (grouped.intro) {
    items.push({ id: "section-intro", label: "Inicio", percent: grouped.intro.progress.percent });
  }

  for (const group of grouped.groups) {
    items.push({ id: `group-${group.letter}`, label: group.letter, percent: group.progress.percent });
  }

  if (grouped.fwcClosing) {
    items.push({ id: "section-fwc", label: "FWC", percent: grouped.fwcClosing.progress.percent });
  }

  return (
    <nav aria-label="Saltar a sección" className="rounded-xl border border-slate-200 bg-white p-2">
      <ul className="flex gap-1.5 overflow-x-auto">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ProgressDot percent={item.percent} />
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ProgressDot({ percent }: { percent: number }) {
  const size = 18;
  const stroke = 2.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (circumference * percent) / 100;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="text-emerald-500"
      />
    </svg>
  );
}
