"use client";

import { useActionState, useRef, useState } from "react";
import { createExpense } from "@/app/actions";
import type { Kind } from "@/lib/money";

const COPY = {
  saida: { button: "Adicionar gasto", title: "Novo gasto", placeholder: "Ex.: Mercado", buttonClass: "btn-secondary", icon: "M5 12h14" },
  investimento: { button: "Guardar dinheiro", title: "Novo investimento", placeholder: "Ex.: Reserva", buttonClass: "btn-secondary", icon: "M5 12h14" },
  entrada: { button: "Adicionar entrada", title: "Nova entrada", placeholder: "Ex.: Freela", buttonClass: "btn-primary", icon: "M12 5v14M5 12h14" },
} as const;

/** Botão que abre, num modal, o formulário de nova movimentação: gasto, investimento ou entrada. */
export function AddExpenseForm({ today, kind = "saida" }: { today: string; kind?: Kind }) {
  const copy = COPY[kind];
  const dialog = useRef<HTMLDialogElement>(null);
  // Muda a cada fechamento: o formulário remonta limpo (campos e erro) na próxima abertura.
  const [formKey, setFormKey] = useState(0);
  const close = () => dialog.current?.close();

  return (
    <>
      <button onClick={() => dialog.current?.showModal()} className={`btn ${copy.buttonClass} px-5`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d={copy.icon} />
        </svg>
        {copy.button}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`${kind}-title`}
        onClose={() => setFormKey((k) => k + 1)}
        // Clique no fundo (fora do conteúdo) fecha.
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-cartao bg-superficie text-tinta shadow-nivel-1 backdrop:bg-tinta/40"
      >
        <ExpenseFormBody key={formKey} kind={kind} today={today} onDone={close} />
      </dialog>
    </>
  );
}

function ExpenseFormBody({ kind, today, onDone }: { kind: Kind; today: string; onDone: () => void }) {
  const copy = COPY[kind];
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof createExpense>[0], formData: FormData) => {
      const result = await createExpense(prev, formData);
      if (!result) onDone();
      return result;
    },
    null,
  );

  // Ids com o tipo como prefixo: os três formulários existem na página ao mesmo tempo.
  const id = (field: string) => `${kind}-${field}`;

  // O showModal() foca o primeiro campo (descrição) ao abrir.
  return (
    <form action={action} className="flex flex-col gap-5 p-6">
      <h2 id={id("title")} className="font-display text-h2 font-semibold">{copy.title}</h2>
      <input type="hidden" name="kind" value={kind} />
      <div className="flex flex-wrap gap-4">
        <div className="field flex-[2_1_240px]">
          <label htmlFor={id("description")} className="label">Descrição</label>
          <input id={id("description")} name="description" placeholder={copy.placeholder} required className="input" />
        </div>
        <div className="field flex-[1_1_160px]">
          <label htmlFor={id("amount")} className="label">Valor</label>
          <div className="input-group">
            <span aria-hidden="true">R$</span>
            <input id={id("amount")} name="amount" inputMode="decimal" placeholder="25,90" required />
          </div>
        </div>
        <div className="field flex-[1_1_160px]">
          <label htmlFor={id("spentAt")} className="label">Data</label>
          <input id={id("spentAt")} name="spentAt" type="date" defaultValue={today} required className="input" />
        </div>
      </div>
      {state?.error && <p role="alert" className="form-error">{state.error}</p>}
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onDone} className="btn btn-secondary">
          Cancelar
        </button>
        <button disabled={pending} className="btn btn-primary">
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
