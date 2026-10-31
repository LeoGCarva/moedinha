"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveWeeklyHours } from "@/app/quanto-custa/actions";
import { formatBRL, formatHours, hourlyRate, parseBRL, workHoursFor } from "@/lib/money";

/** Preço digitado → horas de trabalho, usando a renda do perfil e a carga horária semanal. */
export function WorkHoursCalculator({ income, savedHours }: { income: number; savedHours: number | null }) {
  const [price, setPrice] = useState("");
  const [hours, setHours] = useState(savedHours ? String(savedHours) : "");
  const [state, action, pending] = useActionState(saveWeeklyHours, null);

  const priceCents = parseBRL(price);
  const weekly = Number(hours);
  const validHours = Number.isInteger(weekly) && weekly >= 1 && weekly <= 168;
  const ready = income > 0 && validHours && priceCents !== null && priceCents > 0;
  // O botão de salvar só aparece quando o campo difere do que está no perfil.
  const changed = validHours && weekly !== savedHours;

  return (
    <section className="card flex flex-col gap-6 p-5 sm:p-8">
      <form action={action} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="field flex-[2_1_240px]">
            <label htmlFor="price" className="label">Preço</label>
            <div className="input-group">
              <span aria-hidden="true">R$</span>
              <input
                id="price"
                inputMode="decimal"
                placeholder="1.000,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div className="field flex-[1_1_200px]">
            <label htmlFor="weeklyHours" className="label">Horas de trabalho por semana</label>
            <input
              id="weeklyHours"
              name="weeklyHours"
              type="number"
              min={1}
              max={168}
              placeholder="40"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="input"
            />
          </div>
        </div>
        {(changed || state) && (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {state?.error && <p role="alert" className="form-error mr-auto">{state.error}</p>}
            {state?.ok && !changed && <p role="status" className="mr-auto font-semibold text-entrada">Carga horária salva.</p>}
            {changed && (
              <button disabled={pending} aria-busy={pending} className="btn btn-secondary">
                Salvar carga horária
              </button>
            )}
          </div>
        )}
      </form>

      {income <= 0 ? (
        <p role="status" className="rounded-campo bg-atencao-claro px-4 py-3 font-semibold text-atencao">
          Informe sua renda mensal no <Link href="/perfil" className="underline underline-offset-4">perfil</Link> para calcular.
        </p>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-2 rounded-cartao bg-cofre p-6 text-white sm:p-8">
          {ready ? (
            <>
              <p className="overline text-sobre-cofre">Você precisa trabalhar</p>
              <strong
                data-testid="work-hours"
                className="font-display text-[clamp(2.25rem,5vw,3rem)] font-bold leading-none tracking-[-0.02em]"
              >
                {formatHours(workHoursFor(priceCents, income, weekly))}
              </strong>
              <p className="text-sm text-sobre-cofre">
                Sua hora vale {formatBRL(Math.round(hourlyRate(income, weekly)))}, com base na renda de {formatBRL(income)}.
              </p>
            </>
          ) : (
            <p className="text-sobre-cofre">Digite o preço e as horas por semana para ver o resultado.</p>
          )}
        </div>
      )}
    </section>
  );
}
