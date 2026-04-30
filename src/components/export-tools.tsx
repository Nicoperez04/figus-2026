"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { StickerView } from "@/lib/album";

function toLines(stickers: StickerView[]) {
  return stickers
    .map((sticker) => `${sticker.code} - ${sticker.teamName ?? sticker.sectionName} - ${sticker.title}`)
    .join("\n");
}

function toCsv(stickers: StickerView[]) {
  const rows = [["codigo", "nombre", "seccion", "grupo", "seleccion", "cantidad_repetida"]];
  for (const sticker of stickers) {
    rows.push([
      sticker.code,
      sticker.title,
      sticker.sectionName,
      sticker.group ?? "",
      sticker.teamName ?? "",
      String(sticker.repeatedQuantity),
    ]);
  }
  return rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
}

export function ExportTools({ missing, repeated }: { missing: StickerView[]; repeated: StickerView[] }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function copy(text: string, label: string) {
    if (text.length === 0) {
      setFeedback(`No hay ${label} para copiar.`);
    } else {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label} copiadas al portapapeles ✓`);
    }
    setTimeout(() => setFeedback(null), 2200);
  }

  function downloadCsv(stickers: StickerView[], fileName: string) {
    const blob = new Blob([toCsv(stickers)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="secondary" size="md" onClick={() => copy(toLines(missing), "Faltantes")}>
          Copiar faltantes ({missing.length})
        </Button>
        <Button variant="secondary" size="md" onClick={() => copy(toLines(repeated), "Repetidas")}>
          Copiar repetidas ({repeated.length})
        </Button>
        <Button variant="primary" size="md" onClick={() => downloadCsv([...missing, ...repeated], "figus-2026.csv")}>
          Descargar CSV
        </Button>
      </div>
      {feedback ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
