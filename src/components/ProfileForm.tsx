"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/perfil/actions";

export function ProfileForm({ monthlyIncome, payday }: { monthlyIncome: string; payday: number | null }) {
  const [state, action, pending] = useActionState(saveProfile, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-4">
        <div className="field flex-[2_1_240px]">
          <label htmlFor="monthlyIncome" className="label">Renda mensal</label>
          <div className="input-group">
            <span aria-hidden="true">R$</span>
            <input
              id="monthlyIncome"
              name="monthlyIncome"
              inputMode="decimal"
              placeholder="3.500,00"
              defaultValue={monthlyIncome}
              required
            />
          </div>
        </div>
        <div className="field flex-[1_1_160px]">
          <label htmlFor="payday" className="label">Dia do recebimento</label>
          <input
            id="payday"
            name="payday"
            type="number"
            min={1}
            max={31}
            placeholder="1 a 31"
            defaultValue={payday ?? ""}
            required
            className="input"
          />
        </div>
      </div>
      {state?.error && <p role="alert" className="form-error">{state.error}</p>}
      <div className="flex justify-end">
        <button disabled={pending} aria-busy={pending} className="btn btn-primary">
          Salvar
        </button>
      </div>
    </form>
  );
}
