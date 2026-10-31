const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(cents: number) {
  return brl.format(cents / 100);
}

export type Kind = "saida" | "investimento" | "entrada";

/** Entrada soma à conta (+1); gasto e investimento tiram dela (−1). */
export const kindSign = (kind: Kind) => (kind === "entrada" ? 1 : -1);

/** Gasto ou investimento → "− R$ 10,00"; entrada → "+ R$ 10,00". */
export function formatSigned(cents: number, kind: Kind) {
  return `${kindSign(kind) > 0 ? "+" : "−"} ${formatBRL(cents)}`;
}

/** "1.234,56", "1234.56" ou "12" → centavos. Retorna null se inválido. */
export function parseBRL(input: string): number | null {
  let s = input.trim().replace(/^R\$\s*/, "").replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

/**
 * Mês `ym` ("YYYY-MM") ou, se ausente/inválido, o mês atual (fuso de São Paulo).
 * `start`/`end` = primeiro dia do mês e do próximo em "YYYY-MM-DD"; `prev`/`next` em "YYYY-MM".
 */
export function monthRange(ym?: string, now = new Date()) {
  const [year, month] = (
    ym && /^\d{4}-(0[1-9]|1[0-2])$/.test(ym)
      ? ym
      : new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
        }).format(now)
  )
    .split("-")
    .map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  const prev = month === 1 ? [year - 1, 12] : [year, month - 1];
  return {
    year,
    month,
    start: `${year}-${pad(month)}-01`,
    end: `${next[0]}-${pad(next[1])}-01`,
    prev: `${prev[0]}-${pad(prev[1])}`,
    next: `${next[0]}-${pad(next[1])}`,
  };
}

/**
 * Ciclo de recebimento que termina no mês: do `payday` do mês anterior até a véspera do `payday` deste mês
 * (ex.: payday 20, novembro → 20/10 a 19/11). Com payday 1 o ciclo é o próprio mês.
 * Payday além do fim do mês (29–31) vira o último dia. `end` é exclusivo; `last` é o último dia incluído.
 */
export function payCycle(year: number, month: number, payday: number) {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // Em UTC para não haver desvio de fuso; dia 0 do mês seguinte = último dia do mês.
  // Date.UTC normaliza mês 0 → dezembro do ano anterior e mês 13 → janeiro do seguinte.
  const clamped = (y: number, m: number) =>
    new Date(Date.UTC(y, m - 1, Math.min(payday, new Date(Date.UTC(y, m, 0)).getUTCDate())));
  const payThisMonth = clamped(year, month);
  const [start, end] =
    payThisMonth.getUTCDate() === 1
      ? [payThisMonth, new Date(Date.UTC(year, month, 1))]
      : [clamped(year, month - 1), payThisMonth];
  return {
    start: iso(start),
    end: iso(end),
    last: iso(new Date(end.getTime() - 86_400_000)),
  };
}

/** Ciclo de recebimento que contém a data `iso` ("YYYY-MM-DD"): o que termina neste mês ou, se o recebimento já passou, no próximo. */
export function cycleOf(iso: string, payday: number) {
  const [year, month] = iso.split("-").map(Number);
  const cycle = payCycle(year, month, payday);
  // Strings ISO comparam na ordem cronológica.
  if (iso < cycle.end) return cycle;
  return month === 12 ? payCycle(year + 1, 1, payday) : payCycle(year, month + 1, payday);
}

/** Ciclos antes de `current`, do mais recente ao mais antigo, até o que contém `earliest` ("YYYY-MM-DD"). */
export function previousCycles(current: { start: string }, payday: number, earliest: string) {
  const cycles: ReturnType<typeof payCycle>[] = [];
  let start = current.start;
  while (start > earliest) {
    // Véspera do início = último dia do ciclo anterior.
    const eve = new Date(Date.parse(`${start}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    const cycle = cycleOf(eve, payday);
    cycles.push(cycle);
    start = cycle.start;
  }
  return cycles;
}

/** "2026-10-05" → "05/10" */
export function formatDayMonth(iso: string) {
  return iso.slice(5).split("-").reverse().join("/");
}

const monthFmt = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

/** "outubro de 2026" */
export function monthLabel(year: number, month: number) {
  return monthFmt.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/** Semanas num mês médio (52 semanas ÷ 12 meses). */
const WEEKS_PER_MONTH = 52 / 12;

/** Horas de trabalho para pagar `priceCents`, dada a renda mensal e a carga horária semanal. */
export function workHoursFor(priceCents: number, incomeCents: number, weeklyHours: number) {
  return (priceCents * weeklyHours * WEEKS_PER_MONTH) / incomeCents;
}

/** Valor de uma hora de trabalho, em centavos. */
export function hourlyRate(incomeCents: number, weeklyHours: number) {
  return incomeCents / (weeklyHours * WEEKS_PER_MONTH);
}

/** 49,52 → "49 h 31 min"; 0,5 → "30 min"; abaixo de meio minuto → "menos de 1 min". */
export function formatHours(hours: number) {
  const total = Math.round(hours * 60);
  if (total === 0) return "menos de 1 min";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h && `${h.toLocaleString("pt-BR")} h`, m && `${m} min`].filter(Boolean).join(" ");
}
