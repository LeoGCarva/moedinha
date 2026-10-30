# CONTEXT — Porquinho

> Fonte única de contexto do projeto. **Atualizar este arquivo a cada mudança** (stack, decisões, schema, rotas, status, próximos passos).

_Última atualização: 2026-10-30 — Design v1 aplicado (sistema visual Porquinho)._

## Objetivo
Site onde o usuário autenticado registra quanto gastou e vê o **total de gastos do mês**.

**Design v1 aplicado** (ver seção "Design"). Funcionalidade inalterada.

## Stack
| Item | Escolha | Versão |
|---|---|---|
| Framework | Next.js (App Router, `src/`, alias `@/*`, `cacheComponents: true`) | 16.4.3 |
| UI | React + TypeScript + Tailwind | React 19.3 / TS 5.9 / Tailwind 4 |
| Auth | **Neon Auth** (Managed Better Auth) via `@neondatabase/auth` | 0.7.0-beta |
| Banco | Lakebase Postgres no Neon (projeto `winter-smoke-81531790`, branch `production`, região `sa-east-1`) | — |
| Driver | `pg` (node-postgres) com `Pool` | 8.23 |
| ORM | Drizzle ORM + drizzle-kit | 0.45.4 / 0.31.11 |
| Validação | zod | 4.6.7 |
| Env tipado | `@neon/env` (`parseEnv(config)` a partir de `neon.ts`) | 1.6 |
| Gerenciador | pnpm | 12.4.1 (Node 24) |

> ⚠️ Next.js 16 tem mudanças de API: consultar `node_modules/next/dist/docs/` antes de escrever código (ver `AGENTS.md`). Arquivo de rota protegida é `src/proxy.ts` (não `middleware.ts`).

## Decisões
- **Auth = Neon Auth (Managed Better Auth)**, não BetterAuth auto-hospedado. Usuários/sessões ficam no schema `neon_auth` (gerenciado — não criar migrations nele; `drizzle.config.ts` usa `schemaFilter: ["public"]`). O SDK `@neondatabase/auth` não aceita `plugins` nem `additionalFields`.
- Por isso renda mensal e dia de recebimento ficam na tabela própria **`profile`** (chave = id do usuário do Neon Auth).
- Valores monetários em **centavos (integer)**. Exibição BRL via `Intl.NumberFormat("pt-BR")`; entrada aceita `3500,00`, `1.234,56`, `12.5`, `R$ 10` (`parseBRL` em `src/lib/money.ts`).
- **Calendário** = mês do calendário no fuso America/Sao_Paulo. Mês exibido vem de `?mes=YYYY-MM` (inválido/ausente → mês atual); helpers `monthRange`/`monthLabel` em `src/lib/money.ts`.
- **Ciclo exibido = ciclo de recebimento que contém hoje**, seja qual for o mês na tela (a navegação ‹ › só troca o mês do calendário). Vai do `payday` até a véspera do próximo (ex.: payday 20, hoje 30/10 → 20/10 a 19/11; em outubro pinta 20–31, em novembro 1–19, nos outros meses nada). Com payday 1 o ciclo é o próprio mês. Payday 29–31 em mês curto vira o último dia do mês. `cycleOf(today, payday)` em `src/lib/money.ts` (usa `payCycle()`, o ciclo que termina num mês). Dias do ciclo ficam em branco no calendário e os de fora em cinza (`neutro`); o período aparece no resumo.
- Calendário (`ExpenseCalendar`) é Server Component; datas calculadas em UTC a partir de `spent_at` (string `YYYY-MM-DD`) para evitar desvio de fuso. Semana começa no domingo. A célula de um dia com movimentações mostra o total de saídas (vermelho) e o de entradas (verde); o clique abre um modal (`<dialog>` nativo com `showModal()`, no Client Component `DayExpenses`) com os gastos, o botão de excluir de cada um e o total do dia. Dias sem gasto não são clicáveis.
- Usuário sem `profile` (ex.: login social) é redirecionado de `/` para `/perfil`.
- Toda query/mutação de gastos filtra por `session.user.id` (checado na Server Action, não só no proxy).
- Driver `pg` (recomendação da skill Neon para Next.js na Vercel). Ao fazer deploy na Vercel: adicionar `attachDatabasePool` de `@vercel/functions` em `src/db/index.ts`.
- Cache Components: leituras de sessão chamam `await connection()` e ficam dentro de `<Suspense>`; após mutações usar `refresh()` de `next/cache`.
- `<body>` em `src/app/layout.tsx` tem `suppressHydrationWarning` porque extensões de navegador (ex.: Grammarly) injetam atributos nele. Vale só para os atributos do próprio `<body>`, não para os filhos.
- **Movimentações**: a tabela `expense` guarda gastos (`kind = saida`) e dinheiro guardado (`kind = entrada`). O nome `expense` foi mantido para não mexer em tudo. Na UI os nomes são **Gasto** (etiqueta vermelha, valor `− R$` em `text-saida`) e **Guardado** (etiqueta rosa `rosa-claro`/`rosa-texto`, valor sem sinal em `text-tinta`; no calendário, com um ponto rosa). Exceções: no modal do dia o Guardado é verde com `+ R$` e o rodapé mostra só o "Total do dia" (guardado − gasto, com sinal); na lista "Últimas movimentações" o Guardado é verde (etiqueta `entrada-claro`/`entrada`, valor `text-entrada`), via `KindBadge tone="verde"`. Helpers: `formatSigned` (`money.ts`), `KindBadge` e `kindColor` (`KindBadge.tsx`).
- **Formulários de nova movimentação**: "Adicionar gasto" e "Guardar dinheiro" abrem o formulário num modal (`<dialog>` com `showModal()` em `AddExpenseForm`). O formulário remonta a cada fechamento (`key`), então reabre limpo; salvar com sucesso fecha o modal.
- **Resumo**: card verde `CycleSummary` com "Guardado no ciclo", o período em etiqueta e uma barra que divide a renda em Guardado (`rosa`), Gasto (`cofre-noite` #08342A) e Livre (`white/25`), com legenda e valores. Livre = max(renda − guardado − gasto, 0); se guardado + gasto passar da renda, a barra se ajusta à soma. No fim do card, o texto "Extratos de ciclos anteriores" (`CycleHistory`) abre um modal com cada ciclo anterior (do mais recente até o da movimentação mais antiga, `previousCycles()`): período, guardado (verde) e gasto (vermelho). Coluna da direita: Renda mensal, Gasto no ciclo (com % da renda) e Recebimento.
- Tabela `expense` sem coluna `category` por enquanto (não foi pedido).

## Design (v1)
- Tokens em `src/app/globals.css` (`@theme` do Tailwind 4): cores `cofre` #0F5C46 (primário), `cofre-escuro` #0A4535, `broto` #E3F0EA, `rosa` #F7B8C9, `tinta` #14201B, `tinta-2` #4A5852, `tinta-3` #66736D, `fundo` #F6F7F4, `linha` #DDE3DF, `entrada` #1F7A4D, `saida` #B4232F, `cofre-noite` #08342A (segmento Gasto da barra), `atencao` #A15C00 (+ variantes `-claro`).
- Fontes (`next/font/google` em `layout.tsx`): **Bricolage Grotesque** (`font-display`: títulos e valores) e **Figtree** (`font-sans`: texto/UI). Números com `tabular-nums`.
- Escala: `text-display` 48/52, `text-h1` 32/40, `text-h2` 24/32, `text-h3` 18/26, corpo 16/24, `small` 14/20, `.overline` 12/16 caixa alta.
- Raios: `rounded-etiqueta` 8, `rounded-campo` 12, `rounded-cartao` 16. Sombras `shadow-nivel-1`/`-2`.
- Classes de componente (`@layer components`): `.btn` + `.btn-primary|secondary|ghost|danger` (48 px), `.field`, `.label`, `.input`, `.input-group` (prefixo R$), `.help`, `.form-error`, `.card`, `.overline`, `.divider`.
- Componentes novos: `Logo` (cofrinho + moeda) e `AppHeader` (nav Início/Perfil + Sair) nas páginas autenticadas.
- Só tema claro (o modo escuro automático foi removido).

## Variáveis de ambiente
`.env.local` (não versionado; modelo em `.env.example`):
- Preenchidas por `neon deploy` / `neon env pull`: `DATABASE_URL` (pooled, app), `DATABASE_URL_UNPOOLED` (direta, migrations), `NEON_BRANCH`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`.
- Da aplicação: `NEON_AUTH_COOKIE_SECRET` (`openssl rand -base64 32`).

## Neon
- `neon.ts`: `auth: true` (Postgres implícito). `.neon` guarda o contexto do projeto/branch local.
- Provedores OAuth: **Google = credenciais compartilhadas do Neon (só dev)**; **GitHub não habilitado** (requer OAuth App próprio → `neon neon-auth oauth-provider ...`). Callback do provedor: `{NEON_AUTH_BASE_URL}/callback/{provider}`.
- Domínios: localhost pré-aprovado. Produção: `neon neon-auth domain add https://<domínio>`.
- Emails de auth usam SMTP compartilhado do Neon; produção precisa de SMTP próprio.

## Schema (`src/db/schema.ts`; migration `drizzle/0000_*.sql` aplicada, `drizzle/0001_*.sql` (coluna `kind`) **gerada, pendente de `pnpm db:migrate`**)
- `profile`: `user_id` text PK, `monthly_income` int (centavos), `payday` int (1–31), `created_at`, `updated_at`.
- `expense`: `id` uuid PK, `user_id` text, `description` text, `amount` int (centavos), `kind` text `saida`|`entrada` (default `saida`), `spent_at` date, `created_at`. Índice `(user_id, spent_at)`.
- `neon_auth.*`: gerenciado pelo Neon Auth.

## Rotas
| Rota | Descrição | Protegida |
|---|---|---|
| `/` | Botões "Adicionar gasto" (secundário) e "Guardar dinheiro" (primário); resumo (`CycleSummary`: guardado no ciclo, período, barra Guardado/Gasto/Livre, modal "Extratos de ciclos anteriores"; cards Renda, Gasto no ciclo com % da renda, Recebimento); calendário do mês com os totais de gasto e guardado de cada dia (dias do ciclo em branco, os de fora em cinza; clique abre modal com as movimentações e o botão de excluir), navegação ‹ › via `?mes=YYYY-MM`; "Últimas movimentações" (10 mais recentes de qualquer mês, etiqueta Gasto/Guardado) | Sim |
| `/login` | Email/senha + Google + GitHub | Não |
| `/cadastro` | Nome, email, senha, renda mensal, dia do recebimento (+ botões sociais) | Não |
| `/perfil` | Dados pessoais (nome editável via `auth.updateUser`, e-mail somente leitura); criar/editar renda e dia; sair | Sim |
| `/api/auth/[...path]` | Proxy do Neon Auth (`auth.handler()`) | — |

## Estrutura
```
src/
  app/ page.tsx, actions.ts (createExpense, deleteExpense)
       login/ (page, actions)  cadastro/ (page, actions)  perfil/ (page, actions)
       api/auth/[...path]/route.ts
  components/ AddExpenseForm (prop `kind`), AppHeader, DayExpenses, CycleSummary, ExpenseCalendar, KindBadge, Logo, RecentMovements, ProfileForm, SignOutButton, SocialButtons
  db/ index.ts (Pool + drizzle), schema.ts
  lib/ auth/{server,client,session}.ts, money.ts, validation.ts (zod)
  proxy.ts (protege / e /perfil)
drizzle/ (migrations)   drizzle.config.ts   neon.ts   .env.example
```

## Scripts
`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint` · `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:studio`

## Status
- [x] Fase 0 — Setup
- [x] Fase 1 — Banco (Neon + Drizzle, migration aplicada)
- [x] Fase 2 — Autenticação (Neon Auth: email/senha, Google; GitHub pendente de credenciais)
- [x] Fase 3 — Gastos (adicionar, listar, excluir, total do mês)
- [x] Calendário de gastos + navegação entre meses (`pnpm lint` ✓, `pnpm build` ✓; E2E manual pendente)
- Verificado: `pnpm build` ✓, `pnpm lint` ✓, E2E em Chrome headless (12/13; única falha = GitHub não habilitado).

## Pendências do usuário
- Criar OAuth App no GitHub e habilitar no Neon Auth (`neon neon-auth oauth-provider`), callback `{NEON_AUTH_BASE_URL}/callback/github`.
- Para produção: OAuth App próprio do Google, SMTP próprio, domínio confiável.

## Futuro (fora do escopo agora)
Saldo (renda − gastos), categorias, edição de gastos, deploy na Vercel.

## Histórico
- 2026-10-30 — Plano definido; Fase 0 (Next 16.4.3 + deps; `esbuild` liberado e `core-js` negado em `pnpm-workspace.yaml`; `.env.example` des-ignorado).
- 2026-10-30 — `neon init` + `neon deploy` (Postgres + Neon Auth). Troca de BetterAuth auto-hospedado → Neon Auth; `@neondatabase/serverless` → `pg`. Tabela `profile` criada para renda/dia. Fases 1–3 implementadas e testadas E2E; dados de teste removidos.
- 2026-10-30 — Lista de gastos da home substituída por calendário mensal (`ExpenseCalendar`) com navegação ‹ › (`?mes=`); `currentMonthRange` → `monthRange` + `monthLabel`.
- 2026-10-30 — Total passa a seguir o ciclo do dia de recebimento (`payCycle`); calendário continua mensal, com dias do ciclo destacados em verde e período "de DD/MM a DD/MM" ao lado do total.
- 2026-10-30 — `suppressHydrationWarning` no `<body>` (aviso de hydration causado pela extensão Grammarly).
- 2026-10-30 — Design v1: tokens Tailwind, fontes Bricolage Grotesque + Figtree, `Logo` e `AppHeader`, telas de login, cadastro, início (resumo + calendário) e perfil restilizadas, rótulos visíveis em todos os campos. Lógica e `data-testid` mantidos.
- 2026-10-30 — Célula do calendário mostra só o total do dia; detalhes e exclusão em modal (`DayExpenses`, `<dialog>` nativo).
- 2026-10-30 — Feature "Guardar dinheiro": coluna `kind` em `expense` (migration 0001, pendente de aplicar), botão de entrada, card "Guardado no ciclo", lista "Últimas movimentações" (`RecentMovements`, `KindBadge`) e dois totais (saída/entrada) por dia no calendário e no modal.
- 2026-10-30 — Resumo: card "Guardado no ciclo" (verde) empilhado em cima do "Total do ciclo", que passou a ter fundo vermelho (`bg-saida`).
- 2026-10-30 — Card "Guardado no ciclo" maior (mesmo estilo do total) e card do total com vermelho menos brilhante (token `saida-fundo`).
- 2026-10-30 — Resumo refeito pelo mockup "Resumo — proposta": `CycleSummary` com barra Guardado/Gasto/Livre, card "Gasto no ciclo" com % da renda, botões trocados (gasto secundário, guardar primário), nomes Gasto/Guardado em toda a UI. Card vermelho e token `saida-fundo` removidos.
- 2026-10-30 — "Adicionar gasto" e "Guardar dinheiro" passam a abrir o formulário num modal `<dialog>` por cima da página.
- 2026-10-30 — "Últimas movimentações": Guardado em verde (etiqueta e valor).
- 2026-10-30 — Calendário: dias contados no ciclo em branco e os de fora em cinza (`neutro`, texto `tinta-2`); legenda com os dois.
- 2026-10-30 — Modal do dia: Guardado em verde (`+ R$`), gasto `− R$` em vermelho, e um único "Total do dia" = guardado − gasto (verde se positivo, vermelho se negativo).
- 2026-10-30 — `payCycle` passa a usar o ciclo que **termina** no mês exibido (antes: o que começava). Cores do calendário e resumo seguem a nova regra.
- 2026-10-30 — Resumo e cores do calendário passam a usar sempre o ciclo que contém hoje (`cycleOf`), independente do mês exibido; antes outubro mostrava o ciclo já encerrado 20/09–19/10 (zerado).
- 2026-10-30 — "Extratos de ciclos anteriores" no card do resumo: modal com guardado e gasto de cada ciclo anterior (`CycleHistory`, `previousCycles`).
- 2026-10-30 — Perfil: card "Dados pessoais" (`PersonalDataForm`, action `saveName`) com nome editável e e-mail desabilitado. Após salvar, o cookie de cache da sessão do Neon Auth (`__Secure-neon-auth.local.session_data`) é apagado para o nome novo aparecer na hora.
