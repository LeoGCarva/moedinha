import { z } from "zod";
import { parseBRL } from "./money";

const money = z
  .string()
  .transform((v, ctx) => {
    const cents = parseBRL(v);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Valor inválido" });
      return z.NEVER;
    }
    return cents;
  });

export const profileSchema = z.object({
  monthlyIncome: money,
  payday: z.coerce.number().int().min(1, "Dia entre 1 e 31").max(31, "Dia entre 1 e 31"),
});

export const weeklyHoursSchema = z.object({
  weeklyHours: z.coerce
    .number("Informe as horas")
    .int("Use horas inteiras")
    .min(1, "Entre 1 e 168 horas")
    .max(168, "Entre 1 e 168 horas"),
});

export const nameSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(100, "Nome muito longo"),
});

export const signUpSchema = profileSchema.extend({
  name: z.string().trim().min(1, "Informe o nome"),
  email: z.email("Email inválido"),
  password: z.string().min(8, "Senha com no mínimo 8 caracteres"),
});

export const expenseSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição"),
  amount: money.refine((c) => c > 0, "Valor deve ser maior que zero"),
  spentAt: z.iso.date("Data inválida"),
  kind: z.enum(["saida", "investimento", "entrada"], "Tipo inválido"),
});

export type FormState = { error: string } | null;

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos";
}
