"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/Logo";
import { SocialButtons } from "@/components/SocialButtons";
import { signUp } from "./actions";

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signUp, null);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 pt-10 pb-16">
      <Link href="/login" aria-label="Moedinha, entrar">
        <Logo />
      </Link>

      <div className="card flex w-full max-w-[520px] flex-col gap-6 p-6 shadow-nivel-1 sm:p-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-h1 font-bold">Criar conta</h1>
          <p className="text-tinta-2">Leva menos de um minuto.</p>
        </div>

        <SocialButtons />
        <p className="divider">ou com e-mail</p>

        <form action={action} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="overline mb-4 text-tinta-2">Seus dados</legend>
            <div className="field">
              <label htmlFor="name" className="label">Nome</label>
              <input id="name" name="name" placeholder="Como quer ser chamado" autoComplete="name" required className="input" />
            </div>
            <div className="field">
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required className="input" />
            </div>
            <div className="field">
              <label htmlFor="password" className="label">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                required
                minLength={8}
                className="input"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-campo bg-broto p-5">
            <legend className="sr-only">Sua renda</legend>
            <div className="flex flex-col gap-1">
              <p aria-hidden="true" className="overline text-cofre">Sua renda</p>
              <p className="text-sm text-[#2f453b]">
                Usamos o dia do recebimento para fechar o total de cada ciclo.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="field flex-[2_1_200px]">
                <label htmlFor="monthlyIncome" className="label">Renda mensal</label>
                <div className="input-group">
                  <span aria-hidden="true">R$</span>
                  <input id="monthlyIncome" name="monthlyIncome" inputMode="decimal" placeholder="3.500,00" required />
                </div>
              </div>
              <div className="field flex-[1_1_140px]">
                <label htmlFor="payday" className="label">Dia do recebimento</label>
                <input id="payday" name="payday" type="number" min={1} max={31} placeholder="1 a 31" required className="input" />
              </div>
            </div>
          </fieldset>

          {state?.error && <p role="alert" className="form-error">{state.error}</p>}
          <button disabled={pending} aria-busy={pending} className="btn btn-primary">
            Criar conta
          </button>
        </form>

        <p className="text-center text-tinta-2">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-cofre hover:text-cofre-escuro">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
