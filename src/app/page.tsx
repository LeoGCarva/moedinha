import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { AppHeader } from "@/components/AppHeader";
import { CycleSummary } from "@/components/CycleSummary";
import { ExpenseCalendar } from "@/components/ExpenseCalendar";
import { RecentMovements } from "@/components/RecentMovements";
import { getProfile, requireUser } from "@/lib/auth/session";
import { formatBRL, formatSigned, monthLabel, monthRange, cycleOf, previousCycles, todayISO, type Kind } from "@/lib/money";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <AppHeader current="/" />
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-10 pb-16 sm:px-8">
        <Suspense fallback={<p className="text-tinta-2">Carregando...</p>}>
          <Dashboard searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

const navBtn =
  "flex size-11 items-center justify-center rounded-campo border-[1.5px] border-linha-forte bg-superficie text-xl text-tinta hover:border-cofre";

async function Dashboard({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const user = await requireUser();
  const userProfile = await getProfile(user.id);
  if (!userProfile) redirect("/perfil");

  const { mes } = await searchParams;
  const today = todayISO();
  const { year, month, start, end, prev, next } = monthRange(typeof mes === "string" ? mes : undefined);
  const isCurrentMonth = today.startsWith(start.slice(0, 7));
  const cycle = cycleOf(today, userProfile.payday);
  const inMonth = and(eq(expense.userId, user.id), gte(expense.spentAt, start), lt(expense.spentAt, end));
  const inCycle = and(eq(expense.userId, user.id), gte(expense.spentAt, cycle.start), lt(expense.spentAt, cycle.end));

  const sumOf = (kind: Kind) =>
    sql<number>`coalesce(sum(${expense.amount}) filter (where ${expense.kind} = ${kind}), 0)`.mapWith(Number);

  const [expenses, [{ spent, invested, received }], recent, pastDays] = await Promise.all([
    db.select().from(expense).where(inMonth).orderBy(asc(expense.createdAt)),
    db
      .select({ spent: sumOf("saida"), invested: sumOf("investimento"), received: sumOf("entrada") })
      .from(expense)
      .where(inCycle),
    db
      .select()
      .from(expense)
      .where(eq(expense.userId, user.id))
      .orderBy(desc(expense.spentAt), desc(expense.createdAt))
      .limit(10),
    // Totais por dia e tipo antes do ciclo atual, para o extrato dos ciclos anteriores.
    db
      .select({ day: expense.spentAt, kind: expense.kind, cents: sql<number>`sum(${expense.amount})`.mapWith(Number) })
      .from(expense)
      .where(and(eq(expense.userId, user.id), lt(expense.spentAt, cycle.start)))
      .groupBy(expense.spentAt, expense.kind)
      .orderBy(asc(expense.spentAt)),
  ]);

  const history = pastDays.length
    ? previousCycles(cycle, userProfile.payday, pastDays[0].day).map((c) => {
        const sumKind = (kind: Kind) =>
          pastDays.filter((d) => d.kind === kind && d.day >= c.start && d.day < c.end).reduce((acc, d) => acc + d.cents, 0);
        return {
          start: c.start,
          last: c.last,
          received: sumKind("entrada"),
          invested: sumKind("investimento"),
          spent: sumKind("saida"),
        };
      })
    : [];

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <h1 className="mr-auto font-display text-h1 font-bold">Olá, {user.name}</h1>
        <AddExpenseForm today={today} type="saida" />
        <AddExpenseForm today={today} type="entrada" />
      </div>

      <section aria-label="Resumo" className="flex flex-wrap gap-6">
        <CycleSummary
          invested={invested}
          spent={spent}
          received={received}
          income={userProfile.monthlyIncome}
          start={cycle.start}
          last={cycle.last}
          history={history}
        />

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <div className="card flex flex-col gap-1.5 p-6">
            <span className="text-sm font-semibold text-tinta-2">Renda mensal</span>
            <span className="font-display text-[28px] leading-9 font-bold">{formatBRL(userProfile.monthlyIncome)}</span>
            {received > 0 && (
              <span data-testid="cycle-received" className="text-sm font-semibold text-entrada">
                {formatSigned(received, "entrada")} em entradas no ciclo
              </span>
            )}
          </div>
          <div className="card flex flex-col gap-1.5 p-6">
            <span className="text-sm font-semibold text-tinta-2">Gasto no ciclo</span>
            <span data-testid="month-total" className="font-display text-[28px] leading-9 font-bold text-saida">
              {formatSigned(spent, "saida")}
            </span>
            {userProfile.monthlyIncome + received > 0 && (
              <span className="text-sm text-tinta-2">
                {Math.round((spent / (userProfile.monthlyIncome + received)) * 100)}% da renda
              </span>
            )}
          </div>
          <div className="card flex flex-col gap-1.5 p-6">
            <span className="text-sm font-semibold text-tinta-2">Recebimento</span>
            <span className="font-display text-[28px] leading-9 font-bold">Todo dia {userProfile.payday}</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="mes-atual" className="card flex flex-col gap-5 p-4 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href={`/?mes=${prev}`} className={navBtn} aria-label="Mês anterior">‹</Link>
            <h2 id="mes-atual" className="min-w-0 px-2 font-display text-h2 font-semibold capitalize">
              {monthLabel(year, month)}
            </h2>
            <Link href={`/?mes=${next}`} className={navBtn} aria-label="Próximo mês">›</Link>
          </div>
          {!isCurrentMonth && (
            <Link href="/" className="btn btn-ghost">
              Voltar para hoje
            </Link>
          )}
        </div>

        <ExpenseCalendar
          year={year}
          month={month}
          expenses={expenses}
          today={today}
          cycleStart={cycle.start}
          cycleEnd={cycle.end}
        />
      </section>

      <RecentMovements items={recent} />
    </>
  );
}
