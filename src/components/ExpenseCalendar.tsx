import { DayExpenses } from "@/components/DayExpenses";
import type { expense } from "@/db/schema";

type Expense = typeof expense.$inferSelect;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function ExpenseCalendar({
  year,
  month,
  expenses,
  today,
  cycleStart,
  cycleEnd,
}: {
  year: number;
  month: number;
  expenses: Expense[];
  today: string;
  cycleStart: string;
  cycleEnd: string; // exclusivo
}) {
  const byDay = new Map<string, Expense[]>();
  for (const e of expenses) byDay.set(e.spentAt, [...(byDay.get(e.spentAt) ?? []), e]);

  // Em UTC para não haver desvio de fuso.
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;

  return (
    <div className="flex flex-col gap-3">
      {/* Em telas estreitas o calendário rola na horizontal dentro da caixa. */}
      <div className="overflow-x-auto rounded-campo border border-linha">
        <div className="grid min-w-[700px] grid-cols-7 gap-px bg-linha">
          {WEEKDAYS.map((w) => (
            <div key={w} className="overline bg-neutro px-2 py-2.5 text-center text-tinta-2">
              {w}
            </div>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <div key={`empty-${i}`} className="bg-neutro" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const iso = prefix + String(i + 1).padStart(2, "0");
            const dayExpenses = byDay.get(iso) ?? [];
            // Strings ISO comparam na ordem cronológica.
            const inCycle = iso >= cycleStart && iso < cycleEnd;
            const isToday = iso === today;
            // Dias contados no ciclo ficam claros; os de fora, em cinza.
            const cycleColor = inCycle ? "bg-superficie" : "bg-neutro text-tinta-2";
            if (dayExpenses.length > 0) {
              return (
                <div key={iso} data-testid={`day-${iso}`} data-in-cycle={inCycle} className={`text-sm ${cycleColor}`}>
                  <DayExpenses
                    iso={iso}
                    day={i + 1}
                    isToday={isToday}
                    expenses={dayExpenses.map(({ id, description, amount, kind }) => ({ id, description, amount, kind }))}
                  />
                </div>
              );
            }
            return (
              <div
                key={iso}
                data-testid={`day-${iso}`}
                data-in-cycle={inCycle}
                className={`flex min-h-24 flex-col gap-1.5 p-2 text-sm ${cycleColor}`}
              >
                <span
                  aria-current={isToday ? "date" : undefined}
                  className={`flex size-7 items-center justify-center rounded-full text-[13px] font-semibold ${
                    isToday ? "bg-cofre text-white" : ""
                  }`}
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-2">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-4 rounded border border-linha-forte bg-superficie" />
          Conta no total do ciclo
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-4 rounded border border-linha-forte bg-neutro" />
          Fora do ciclo
        </li>
      </ul>
    </div>
  );
}
