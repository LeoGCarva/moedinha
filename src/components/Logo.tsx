/** Marca do Porquinho: cofrinho com moeda. `inverted` = versão para fundo verde. */
export function Logo({ inverted = false, size = 36 }: { inverted?: boolean; size?: number }) {
  return (
    <span className={`flex items-center gap-2.5 ${inverted ? "text-white" : "text-tinta"}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill={inverted ? "#FFFFFF" : "#0F5C46"} />
        <path d="M11 22c0-5 4-8 9-8s9 3 9 8-4 7-9 7-9-2-9-7z" fill="#F7B8C9" />
        <rect x="17" y="17" width="6" height="2" rx="1" fill="#0F5C46" />
        <circle cx="20" cy="10" r="3" fill="#F2C14E" />
      </svg>
      <span className="font-display text-[22px] font-bold leading-none">Moedinha</span>
    </span>
  );
}
