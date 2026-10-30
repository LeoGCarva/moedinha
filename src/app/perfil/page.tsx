import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { ProfileForm } from "@/components/ProfileForm";
import { SignOutButton } from "@/components/SignOutButton";
import { getProfile, requireUser } from "@/lib/auth/session";

export default function PerfilPage() {
  return (
    <>
      <AppHeader current="/perfil" />
      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-10 pb-16 sm:px-8">
        <h1 className="font-display text-h1 font-bold">Seu perfil</h1>
        <Suspense fallback={<p className="text-tinta-2">Carregando...</p>}>
          <Profile />
        </Suspense>
      </main>
    </>
  );
}

async function Profile() {
  const user = await requireUser();
  const current = await getProfile(user.id);

  return (
    <>
      {!current && (
        <p role="status" className="rounded-campo bg-atencao-claro px-4 py-3 font-semibold text-atencao">
          Informe sua renda mensal e o dia do recebimento para continuar.
        </p>
      )}

      <section className="card flex flex-col gap-5 p-5 sm:p-8">
        <h2 className="font-display text-h2 font-semibold">Dados pessoais</h2>
        <PersonalDataForm name={user.name} email={user.email} />
      </section>

      <section className="card flex flex-col gap-5 p-5 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-h2 font-semibold">Renda</h2>
          <p className="text-tinta-2">O dia do recebimento define o início de cada ciclo.</p>
        </div>
        <ProfileForm
          monthlyIncome={current ? (current.monthlyIncome / 100).toFixed(2).replace(".", ",") : ""}
          payday={current?.payday ?? null}
        />
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 font-semibold">Sair da conta</h2>
          <p className="text-tinta-2">Você precisará entrar de novo neste aparelho.</p>
        </div>
        <SignOutButton className="btn btn-danger" />
      </section>
    </>
  );
}
