import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { WorkHoursCalculator } from "@/components/WorkHoursCalculator";
import { CalculatorSkeleton } from "@/components/Skeleton";
import { getProfile, requireUser } from "@/lib/auth/session";

export default function QuantoCustaPage() {
  return (
    <>
      <AppHeader current="/quanto-custa" />
      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 pt-10 pb-16 sm:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h1 font-bold">Quanto custa</h1>
          <p className="text-tinta-2">Veja quantas horas de trabalho você precisa para comprar algo.</p>
        </div>
        <Suspense fallback={<CalculatorSkeleton />}>
          <Calculator />
        </Suspense>
      </main>
    </>
  );
}

async function Calculator() {
  const user = await requireUser();
  const userProfile = await getProfile(user.id);
  if (!userProfile) redirect("/perfil");

  return <WorkHoursCalculator income={userProfile.monthlyIncome} savedHours={userProfile.weeklyHours} />;
}
