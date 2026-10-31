import type { Kind } from "@/lib/money";

const KINDS = {
  saida: { label: "Gasto", badge: "bg-saida-claro text-saida", value: "text-saida" },
  investimento: { label: "Investimento", badge: "bg-investimento-claro text-investimento", value: "text-investimento" },
  entrada: { label: "Entrada", badge: "bg-entrada-claro text-entrada", value: "text-entrada" },
} as const;

/** Cor do valor: gasto em vermelho, investimento em amarelo, entrada em verde. */
export const kindColor = (kind: Kind) => KINDS[kind].value;

/** Etiqueta "Gasto" (vermelha), "Investimento" (amarela) ou "Entrada" (verde). */
export function KindBadge({ kind }: { kind: Kind }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${KINDS[kind].badge}`}>{KINDS[kind].label}</span>
  );
}
