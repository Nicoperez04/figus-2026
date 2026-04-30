"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import type { CompareResult } from "@/lib/album";

function lineFor(sticker: { code: string; teamName: string | null; sectionName: string; title: string }) {
  const place = sticker.teamName ?? sticker.sectionName;
  return `${sticker.code} · ${place} · ${sticker.title}`;
}

function joinList(stickers: { code: string; teamName: string | null; sectionName: string; title: string }[]) {
  if (stickers.length === 0) return "(ninguna)";
  return stickers.map((sticker) => lineFor(sticker)).join("\n");
}

function buildExchangeMessage(comparison: CompareResult) {
  const give = comparison.theyNeed.length > 0 ? joinList(comparison.theyNeed) : "(ninguna)";
  const receive = comparison.iNeed.length > 0 ? joinList(comparison.iNeed) : "(ninguna)";

  return [
    `Hola ${comparison.other.name}, comparé nuestros álbumes de Figus 2026.`,
    "",
    "Vos me podés dar:",
    receive,
    "",
    "Yo te puedo dar:",
    give,
  ].join("\n");
}

export function ExchangeTools({ comparison }: { comparison: CompareResult }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const message = useMemo(() => buildExchangeMessage(comparison), [comparison]);
  const whatsappHref = useMemo(
    () => `https://wa.me/?text=${encodeURIComponent(message)}`,
    [message],
  );

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Lista copiada al portapapeles ✓");
    } catch {
      setFeedback("No pudimos copiar automáticamente.");
    }
    setTimeout(() => setFeedback(null), 2200);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <header>
        <h2 className="text-base font-semibold text-slate-900">Compartir el intercambio</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Copialo o mandalo por WhatsApp para coordinar el cambio.
        </p>
      </header>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" size="md" onClick={copyMessage}>
          Copiar lista de intercambio
        </Button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-200 bg-emerald-600 px-3.5 text-[13px] font-medium text-white shadow-[0_1px_2px_0_rgba(13,122,82,0.25)] transition hover:bg-emerald-700"
        >
          Compartir por WhatsApp
        </a>
      </div>

      {feedback ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {feedback}
        </p>
      ) : null}

      <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-700">
          Ver mensaje
        </summary>
        <pre className="whitespace-pre-wrap px-3 pb-3 text-[11.5px] leading-relaxed text-slate-600">
          {message}
        </pre>
      </details>
    </div>
  );
}
