import type { ReactNode } from "react";

/** Bloco pulsando no lugar de um conteúdo que ainda está carregando: cinza, ou verde-claro sobre o card verde. */
export function Skeleton({ className = "", tone = "cinza" }: { className?: string; tone?: "cinza" | "verde" }) {
  const color = tone === "verde" ? "bg-cofre/15" : "bg-neutro";
  // Raio padrão só quando o className não traz o seu (evita duas classes rounded-* em conflito).
  const radius = className.includes("rounded-") ? "" : "rounded-campo";
  return <div aria-hidden="true" className={`animate-pulse ${radius} ${color} ${className}`} />;
}

/** Envolve um skeleton: anuncia "Carregando..." para leitores de tela. */
function Loading({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">Carregando...</span>
      {children}
    </div>
  );
}

/** Campo de formulário: rótulo + caixa. */
function FieldSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** Início: título e botões, resumo, calendário e últimas movimentações. */
export function DashboardSkeleton() {
  return (
    <Loading className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-4">
        <Skeleton className="mr-auto h-10 w-64" />
        <Skeleton className="h-12 w-44" />
        <Skeleton className="h-12 w-48" />
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex min-h-72 min-w-0 flex-[2_1_560px] flex-col gap-6 rounded-cartao bg-cofre/15 p-8">
          <Skeleton className="h-4 w-36" tone="verde" />
          <Skeleton className="h-14 w-60" tone="verde" />
          <Skeleton className="mt-auto h-3 w-full rounded-full" tone="verde" />
          <Skeleton className="h-4 w-3/4" tone="verde" />
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card flex flex-col gap-3 p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-40" />
            </div>
          ))}
        </div>
      </div>

      <div className="card flex flex-col gap-5 p-4 sm:p-7">
        <Skeleton className="h-11 w-64" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <Skeleton key={i} className="h-16 rounded-md sm:h-24" />
          ))}
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-4 sm:p-7">
        <Skeleton className="h-8 w-64" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </Loading>
  );
}

/** Perfil: dados pessoais, renda e sair. */
export function ProfileSkeleton() {
  return (
    <Loading className="flex flex-col gap-6">
      {[0, 1].map((i) => (
        <div key={i} className="card flex flex-col gap-5 p-5 sm:p-8">
          <Skeleton className="h-8 w-48" />
          <div className="flex flex-wrap gap-4">
            <FieldSkeleton className="flex-[2_1_240px]" />
            <FieldSkeleton className="flex-[1_1_160px]" />
          </div>
          <Skeleton className="h-12 w-28 self-end" />
        </div>
      ))}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-24" />
      </div>
    </Loading>
  );
}

/** Quanto custa: dois campos e o bloco do resultado. */
export function CalculatorSkeleton() {
  return (
    <Loading className="card flex flex-col gap-6 p-5 sm:p-8">
      <div className="flex flex-wrap gap-4">
        <FieldSkeleton className="flex-[2_1_240px]" />
        <FieldSkeleton className="flex-[1_1_200px]" />
      </div>
      <div className="flex flex-col gap-3 rounded-cartao bg-cofre/15 p-6 sm:p-8">
        <Skeleton className="h-4 w-44" tone="verde" />
        <Skeleton className="h-12 w-52" tone="verde" />
        <Skeleton className="h-4 w-72 max-w-full" tone="verde" />
      </div>
    </Loading>
  );
}
