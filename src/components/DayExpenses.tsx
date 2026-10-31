"use client";

import { useRef } from "react";
import { deleteExpense } from "@/app/actions";
import { KindBadge, kindColor } from "@/components/KindBadge";
import { formatBRL, formatSigned, kindSign, type Kind } from "@/lib/money";

/** Valor com sinal no modal: positivo "+ R$", negativo "− R$", zero sem sinal. */
const signed = (cents: number) =>
  cents > 0 ? `+ ${formatBRL(cents)}` : cents < 0 ? `− ${formatBRL(-cents)}` : formatBRL(0);

const DAY_LABEL = { saida: "gastos", investimento: "investido", entrada: "entradas" } as const;

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** Célula de um dia com movimentações: mostra os totais de gasto, investimento e entrada e abre um modal com os detalhes. */
export function DayExpenses({
  iso,
  day,
  isToday,
  expenses,
}: {
  iso: string;
  day: number;
  isToday: boolean;
  expenses: { id: string; description: string; amount: number; kind: Kind }[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const totalOf = (kind: Kind) => expenses.filter((e) => e.kind === kind).reduce((acc, e) => acc + e.amount, 0);
  const totals = (["saida", "investimento", "entrada"] as const)
    .map((kind) => ({ kind, cents: totalOf(kind) }))
    .filter((t) => t.cents > 0);
  // Saldo do dia: entradas menos gastos e investimentos.
  const net = expenses.reduce((acc, e) => acc + kindSign(e.kind) * e.amount, 0);
  // Em UTC para não haver desvio de fuso.
  const label = dayFmt.format(new Date(`${iso}T00:00:00Z`));
  const titleId = `dia-${iso}`;
  const summary = totals
    .map((t) => `${DAY_LABEL[t.kind]} ${formatBRL(t.cents)}`)
    .join(", ");

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Ver movimentações de ${label}: ${summary}`}
        className="flex size-full min-h-24 flex-col gap-1.5 p-2 text-left hover:bg-black/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cofre"
      >
        <span
          aria-current={isToday ? "date" : undefined}
          className={`flex size-7 items-center justify-center rounded-full text-[13px] font-semibold ${
            isToday ? "bg-cofre text-white" : ""
          }`}
        >
          {day}
        </span>
        <span className="mt-auto flex flex-col leading-tight">
          {totals.map((t) => (
            <strong
              key={t.kind}
              data-testid={`day-${t.kind}`}
              className={`flex items-center gap-1 text-[14px] ${kindColor(t.kind)}`}
            >
              {formatSigned(t.cents, t.kind)}
            </strong>
          ))}
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Clique no fundo (fora do conteúdo) fecha.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-cartao bg-superficie text-tinta shadow-nivel-1 backdrop:bg-tinta/40"
      >
        <div className="flex flex-col gap-5 p-6">
          <h2 id={titleId} className="font-display text-h2 font-semibold first-letter:uppercase">
            {label}
          </h2>
          <ul className="flex flex-col divide-y divide-linha">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1 truncate" title={e.description}>{e.description}</span>
                <KindBadge kind={e.kind} />
                <span className={`font-bold ${kindColor(e.kind)}`}>
                  {formatSigned(e.amount, e.kind)}
                </span>
                <form action={deleteExpense.bind(null, e.id)}>
                  <button
                    aria-label={`Excluir ${e.description}`}
                    title={`Excluir ${e.description}`}
                    className="flex size-8 items-center justify-center rounded-md text-tinta-3 hover:bg-saida-claro hover:text-saida"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-linha-forte pt-4">
            <span className="text-sm font-semibold text-tinta-2">Total do dia</span>
            <strong
              data-testid="day-net"
              className={`font-display text-[22px] ${net > 0 ? "text-entrada" : net < 0 ? "text-saida" : "text-tinta"}`}
            >
              {signed(net)}
            </strong>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-secondary">
              Fechar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
