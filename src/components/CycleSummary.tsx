import { CycleHistory, type CycleStatement } from "@/components/CycleHistory";
import { formatBRL, formatDayMonth } from "@/lib/money";

/** Card verde do resumo: quanto foi guardado no ciclo e a divisão da renda em guardado, gasto e livre. */
export function CycleSummary({
  saved,
  spent,
  income,
  start,
  last,
  history,
}: {
  saved: number;
  spent: number;
  income: number;
  start: string;
  last: string;
  history: CycleStatement[];
}) {
  const free = Math.max(income - saved - spent, 0);
  // Se guardado + gasto passar da renda, a barra se ajusta à soma.
  const base = Math.max(income, saved + spent, 1);
  const parts = [
    { key: "guardado", label: "Guardado", cents: saved, color: "bg-rosa", dot: "" },
    // Contorno no ponto da legenda: o verde quase preto some sobre o card.
    { key: "gasto", label: "Gasto", cents: spent, color: "bg-cofre-noite", dot: "ring-1 ring-white/70" },
    { key: "livre", label: "Livre", cents: free, color: "bg-white/25", dot: "" },
  ];

  return (
    <div className="relative flex min-w-0 flex-[2_1_560px] flex-col gap-6 overflow-hidden rounded-cartao bg-cofre p-8 text-white">
      <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 opacity-[0.14]">
        <circle cx="110" cy="110" r="110" fill="#F7B8C9" />
      </svg>

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="overline text-sobre-cofre">Guardado no ciclo</p>
        <span data-testid="cycle-range" className="rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
          {formatDayMonth(start)} a {formatDayMonth(last)}
        </span>
      </div>

      <strong
        data-testid="cycle-saved"
        className="relative font-display text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-none tracking-[-0.02em]"
      >
        {formatBRL(saved)}
      </strong>

      <div className="relative flex flex-col gap-3">
        {/* A legenda abaixo traz os mesmos números em texto. */}
        <div aria-hidden="true" className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {parts
            .filter((p) => p.cents > 0)
            .map((p) => (
              <div
                key={p.key}
                className={`h-full ${p.color}`}
                style={{ width: `${(p.cents / base) * 100}%` }}
              />
            ))}
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {parts.map((p) => (
            <li key={p.key} data-testid={`legend-${p.key}`} className="flex items-center gap-2">
              <span aria-hidden="true" className={`inline-block size-3 rounded-[3px] ${p.color} ${p.dot}`} />
              <span className="text-sobre-cofre">{p.label}</span>
              <strong>{formatBRL(p.cents)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <CycleHistory history={history} year={last.slice(0, 4)} />
    </div>
  );
}
