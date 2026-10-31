"use client";

import { useActionState } from "react";
import { saveName } from "@/app/perfil/actions";

/** Nome editável e e-mail somente leitura. */
export function PersonalDataForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(saveName, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <div className="field flex-[1_1_240px]">
          <label htmlFor="name" className="label">Nome</label>
          <input id="name" name="name" defaultValue={name} autoComplete="name" required className="input" />
        </div>
        <div className="field flex-[1_1_240px]">
          <label htmlFor="email" className="label">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            disabled
            aria-describedby="email-hint"
            className="input"
          />
          <p id="email-hint" className="text-sm text-tinta-2">O e-mail não pode ser alterado.</p>
        </div>
      </div>
      {state?.error && <p role="alert" className="form-error">{state.error}</p>}
      {state?.ok && <p role="status" className="font-semibold text-entrada">Nome salvo.</p>}
      <div className="flex justify-end">
        <button disabled={pending} aria-busy={pending} className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
