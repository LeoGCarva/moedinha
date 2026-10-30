"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/Logo";
import { SocialButtons } from "@/components/SocialButtons";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <div className="flex min-h-screen flex-1 flex-wrap">
      <aside className="relative flex flex-[1_1_440px] flex-col justify-between gap-12 overflow-hidden bg-cofre p-8 text-white sm:p-16">
        <Logo inverted size={40} />
        <div className="relative flex max-w-[520px] flex-col gap-5">
          <h1 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Cada real no lugar certo.
          </h1>
          <p className="text-lg leading-7 text-sobre-cofre">
            Registre seus gastos e veja quanto já saiu de cada ciclo de recebimento.
          </p>
        </div>
        <svg
          width="320"
          height="220"
          viewBox="0 0 320 220"
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 bottom-28 opacity-[0.18]"
        >
          <circle cx="160" cy="130" r="90" fill="#F7B8C9" />
          <circle cx="160" cy="28" r="22" fill="#F2C14E" />
          <rect x="135" y="70" width="50" height="10" rx="5" fill="#0F5C46" />
        </svg>
        <p className="relative text-sm text-sobre-cofre">Só você vê os seus valores.</p>
      </aside>

      <main className="flex flex-[1_1_440px] items-center justify-center px-4 py-12 sm:p-16">
        <div className="flex w-full max-w-[400px] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-h1 font-bold">Entrar</h2>
            <p className="text-tinta-2">Que bom te ver de novo.</p>
          </div>

          <SocialButtons />
          <p className="divider">ou com e-mail</p>

          <form action={action} className="flex flex-col gap-4">
            <div className="field">
              <label htmlFor="email" className="label">E-mail</label>
              <input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required className="input" />
            </div>
            <div className="field">
              <label htmlFor="password" className="label">Senha</label>
              <input id="password" name="password" type="password" placeholder="Sua senha" autoComplete="current-password" required className="input" />
            </div>
            {state?.error && <p role="alert" className="form-error">{state.error}</p>}
            <button disabled={pending} className="btn btn-primary mt-2">
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-tinta-2">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-cofre hover:text-cofre-escuro">
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
