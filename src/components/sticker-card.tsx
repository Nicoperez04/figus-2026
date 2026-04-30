import { updateStickerQuantityAction } from "@/lib/actions";
import type { StickerView } from "@/lib/album-model";

const statusStyles = {
  Falta: {
    container: "border-slate-200 bg-white",
    accent: "bg-slate-300",
    badge: "bg-slate-100 text-slate-600",
    label: "text-slate-500",
  },
  "La tengo": {
    container: "border-emerald-200 bg-emerald-50/40",
    accent: "bg-emerald-500",
    badge: "bg-emerald-600 text-white",
    label: "text-emerald-700",
  },
  Repetida: {
    container: "border-amber-200 bg-amber-50/50",
    accent: "bg-amber-500",
    badge: "bg-amber-500 text-white",
    label: "text-amber-700",
  },
} as const;

export function StickerCard({
  sticker,
  editable = true,
  compact = false,
  showMeta = false,
  highlightRepeated = false,
}: {
  sticker: StickerView;
  editable?: boolean;
  compact?: boolean;
  showMeta?: boolean;
  highlightRepeated?: boolean;
}) {
  const styles = statusStyles[sticker.status];
  const numberLabel = sticker.code.replace(/^[A-Z]+-/, "");
  const padX = compact ? "px-3" : "px-3.5";
  const isTeamSticker = sticker.teamName != null;
  const showFiguritaTitle =
    !isTeamSticker ||
    sticker.orderInTeam == null ||
    sticker.orderInTeam === 1 ||
    sticker.orderInTeam === 13;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border ${styles.container} transition hover:border-slate-300 hover:shadow-sm`}
    >
      <span className={`absolute inset-x-0 top-0 h-0.5 ${styles.accent}`} />
      <div className={`flex items-start justify-between gap-2 ${padX} pt-3 pb-1.5`}>
        <span
          className={`inline-flex items-center rounded-md ${styles.badge} px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none tabular-nums`}
          title={sticker.code}
        >
          {showMeta ? sticker.code : numberLabel}
        </span>
        {sticker.repeatedQuantity > 0 ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none ${
              highlightRepeated ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"
            }`}
          >
            ×{sticker.repeatedQuantity + 1}
          </span>
        ) : null}
      </div>
      {showFiguritaTitle ? (
        <h3
          className={`${padX} text-[12.5px] font-semibold leading-tight text-slate-800 line-clamp-2 ${
            compact ? "min-h-[2rem]" : "min-h-9"
          }`}
          title={sticker.title}
        >
          {sticker.title}
        </h3>
      ) : null}
      <p className={`${padX} ${showFiguritaTitle ? "mt-1" : "mt-0"} text-[10px] font-medium uppercase tracking-wide ${styles.label}`}>
        {sticker.teamName ?? sticker.sectionName}
      </p>
      {showMeta ? (
        <div className={`${padX} mt-1.5 flex flex-wrap items-center gap-1`}>
          {sticker.group ? (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-slate-600">
              Grupo {sticker.group}
            </span>
          ) : null}
          <span
            className={`rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${
              sticker.status === "Repetida"
                ? "bg-amber-100 text-amber-800"
                : sticker.status === "La tengo"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {sticker.status}
          </span>
          {sticker.repeatedQuantity > 0 ? (
            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">
              {sticker.repeatedQuantity} disp.
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={`mt-auto flex items-center justify-between gap-2 border-t border-slate-100 ${padX} py-2`}>
        <span className="text-[11px] font-semibold tabular-nums text-slate-600">
          x{sticker.ownedQuantity}
        </span>
        {editable ? (
          <div className="flex items-center gap-1">
            <QuantityButton
              stickerId={sticker.id}
              operation="decrement"
              label="−"
              ariaLabel="Restar una"
              disabled={sticker.ownedQuantity === 0}
            />
            <QuantityButton stickerId={sticker.id} operation="increment" label="+" ariaLabel="Sumar una" />
          </div>
        ) : (
          <span className={`text-[10px] font-bold uppercase tracking-wide ${styles.label}`}>{sticker.status}</span>
        )}
      </div>
    </article>
  );
}

export function QuickStatusButtons({ stickerId }: { stickerId: string }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-1.5">
      <GhostQuickButton stickerId={stickerId} operation="missing" label="Falta" />
      <GhostQuickButton stickerId={stickerId} operation="owned" label="Tengo" />
      <GhostQuickButton stickerId={stickerId} operation="repeated" label="Repetida" />
    </div>
  );
}

function QuantityButton({
  stickerId,
  operation,
  label,
  ariaLabel,
  disabled = false,
}: {
  stickerId: string;
  operation: string;
  label: string;
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <form action={updateStickerQuantityAction}>
      <input name="stickerId" type="hidden" value={stickerId} />
      <input name="operation" type="hidden" value={operation} />
      <button
        aria-label={ariaLabel}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        type="submit"
        disabled={disabled}
      >
        {label}
      </button>
    </form>
  );
}

function GhostQuickButton({
  stickerId,
  operation,
  label,
}: {
  stickerId: string;
  operation: string;
  label: string;
}) {
  return (
    <form action={updateStickerQuantityAction}>
      <input name="stickerId" type="hidden" value={stickerId} />
      <input name="operation" type="hidden" value={operation} />
      <button
        className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        type="submit"
      >
        {label}
      </button>
    </form>
  );
}
