import type { Kind } from "@/lib/money";

/** Cor do valor: gasto em vermelho, guardado em preto. */
export const kindColor = (kind: Kind) => (kind === "saida" ? "text-saida" : "text-tinta");

/** Etiqueta "Gasto" (vermelha) ou "Guardado" (rosa, ou verde com `tone="verde"`). */
export function KindBadge({ kind, tone = "rosa" }: { kind: Kind; tone?: "rosa" | "verde" }) {
  return kind === "saida" ? (
    <span className="rounded-full bg-saida-claro px-2.5 py-0.5 text-[13px] font-bold text-saida">Gasto</span>
  ) : (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${
        tone === "verde" ? "bg-entrada-claro text-entrada" : "bg-rosa-claro text-rosa-texto"
      }`}
    >
      Guardado
    </span>
  );
}
