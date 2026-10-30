"use client";

import { useRef } from "react";
import { formatBRL, formatDayMonth, formatSigned } from "@/lib/money";

export type CycleStatement = { start: string; last: string; saved: number; spent: number };

/** "05/10", ou "05/10/2025" fora do ano atual. */
const dayLabel = (iso: string, year: string) => (iso.startsWith(year) ? formatDayMonth(iso) : iso.split("-").reverse().join("/"));

/** Texto no card do resumo que abre um modal com o guardado e o gasto de cada ciclo anterior. */
export function CycleHistory({ history, year }: { history: CycleStatement[]; year: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="relative self-start text-sm font-semibold text-sobre-cofre underline underline-offset-4 hover:text-white"
      >
        Extratos de ciclos anteriores
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="cycle-history-title"
        // Clique no fundo (fora do conteúdo) fecha.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-cartao bg-superficie text-tinta shadow-nivel-1 backdrop:bg-tinta/40"
      >
        <div data-testid="cycle-history" className="flex flex-col gap-5 p-6">
          <h2 id="cycle-history-title" className="font-display text-h2 font-semibold">
            Extratos de ciclos anteriores
          </h2>
          {history.length === 0 ? (
            <p className="text-tinta-2">Nenhum ciclo anterior com movimentações.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-tinta-2">
                  <th className="pb-2 font-semibold">Ciclo</th>
                  <th className="pb-2 text-right font-semibold">Guardado</th>
                  <th className="pb-2 text-right font-semibold">Gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha border-t border-linha">
                {history.map((c) => (
                  <tr key={c.start} data-testid="history-row">
                    <td className="py-2.5 pr-3">
                      {dayLabel(c.start, year)} a {dayLabel(c.last, year)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-entrada">{formatBRL(c.saved)}</td>
                    <td className="py-2.5 pl-3 text-right font-bold text-saida">{formatSigned(c.spent, "saida")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
