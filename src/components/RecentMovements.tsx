import { KindBadge, kindColor } from "@/components/KindBadge";
import type { expense } from "@/db/schema";
import { formatDayMonth, formatSigned } from "@/lib/money";

type Movement = Pick<typeof expense.$inferSelect, "id" | "description" | "amount" | "kind" | "spentAt">;

const th = "overline border-b border-linha py-2.5 text-tinta-2";
const td = "border-b border-neutro py-3.5";

export function RecentMovements({ items }: { items: Movement[] }) {
  return (
    <section aria-labelledby="movimentacoes" className="card flex flex-col gap-4 p-4 sm:p-7">
      <h2 id="movimentacoes" className="font-display text-h2 font-semibold">
        Últimas movimentações
      </h2>
      {items.length === 0 ? (
        <p className="text-tinta-2">Nenhuma movimentação ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[15px] leading-[22px]">
            <thead>
              <tr className="text-left">
                <th className={th}>Descrição</th>
                <th className={th}>Tipo</th>
                <th className={th}>Data</th>
                <th className={`${th} text-right`}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} data-testid="movement">
                  <td className={`${td} font-semibold`}>{m.description}</td>
                  <td className={td}>
                    <KindBadge kind={m.kind} tone="verde" />
                  </td>
                  <td className={`${td} text-tinta-2`}>{formatDayMonth(m.spentAt)}</td>
                  <td className={`${td} text-right font-bold ${m.kind === "entrada" ? "text-entrada" : kindColor(m.kind)}`}>
                    {formatSigned(m.amount, m.kind)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
