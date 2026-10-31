"use client";

import { useActionState, useRef, useState } from "react";
import { createExpense } from "@/app/actions";

/** Direção do dinheiro: saída (gasto ou investimento, escolhido no select) ou entrada. */
type FlowType = "saida" | "entrada";

const COPY = {
  saida: { button: "Adicionar saída", title: "Nova saída", buttonClass: "btn-secondary", icon: "M5 12h14" },
  entrada: { button: "Adicionar entrada", title: "Nova entrada", buttonClass: "btn-primary", icon: "M12 5v14M5 12h14" },
} as const;

const PLACEHOLDER = { saida: "Ex.: Mercado", investimento: "Ex.: Reserva", entrada: "Ex.: Freela" } as const;

/** Botão que abre, num modal, o formulário de nova movimentação: saída (gasto ou investimento) ou entrada. */
export function AddExpenseForm({ today, type }: { today: string; type: FlowType }) {
  const copy = COPY[type];
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
        aria-labelledby={`${type}-title`}
        onClose={() => setFormKey((k) => k + 1)}
        // Clique no fundo (fora do conteúdo) fecha.
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-cartao bg-superficie text-tinta shadow-nivel-1 backdrop:bg-tinta/40"
      >
        <ExpenseFormBody key={formKey} type={type} today={today} onDone={close} />
      </dialog>
    </>
  );
}

function ExpenseFormBody({ type, today, onDone }: { type: FlowType; today: string; onDone: () => void }) {
  const copy = COPY[type];
  // Na saída, o select escolhe gasto ou investimento; aqui só troca o placeholder.
  const [kind, setKind] = useState<keyof typeof PLACEHOLDER>(type);
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof createExpense>[0], formData: FormData) => {
      const result = await createExpense(prev, formData);
      if (!result) onDone();
      return result;
    },
    null,
  );

  // Ids com o tipo como prefixo: os dois formulários existem na página ao mesmo tempo.
  const id = (field: string) => `${type}-${field}`;

  // O showModal() foca o primeiro campo (tipo na saída, descrição na entrada) ao abrir.
  return (
    <form action={action} className="flex flex-col gap-5 p-6">
      <h2 id={id("title")} className="font-display text-h2 font-semibold">{copy.title}</h2>
      {type === "entrada" && <input type="hidden" name="kind" value="entrada" />}
      <div className="flex flex-wrap gap-4">
        {type === "saida" && (
          <div className="field flex-[1_1_100%]">
            <label htmlFor={id("kind")} className="label">Tipo</label>
            <select
              id={id("kind")}
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="input"
            >
              <option value="saida">Gasto</option>
              <option value="investimento">Investimento</option>
            </select>
          </div>
        )}
        <div className="field flex-[2_1_240px]">
          <label htmlFor={id("description")} className="label">Descrição</label>
          <input id={id("description")} name="description" placeholder={PLACEHOLDER[kind]} required className="input" />
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
