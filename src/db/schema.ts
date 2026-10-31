import { date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Usuários e sessões vivem no schema `neon_auth` (Neon Auth gerenciado).
// `userId` aqui é o `id` do usuário do Neon Auth.

export const profile = pgTable("profile", {
  userId: text("user_id").primaryKey(),
  monthlyIncome: integer("monthly_income").notNull(), // centavos
  payday: integer("payday").notNull(), // dia do mês, 1–31
  weeklyHours: integer("weekly_hours"), // carga horária semanal (1–168); nulo até o usuário informar
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expense = pgTable(
  "expense",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    description: text("description").notNull(),
    amount: integer("amount").notNull(), // centavos
    // Saída (gasto), investimento (dinheiro guardado, sai da conta) ou entrada (dinheiro que entra na conta).
    kind: text("kind", { enum: ["saida", "investimento", "entrada"] }).notNull().default("saida"),
    spentAt: date("spent_at").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("expense_user_spent_at_idx").on(t.userId, t.spentAt)],
);
