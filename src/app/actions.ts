"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { expenseSchema, firstError, type FormState } from "@/lib/validation";

export async function createExpense(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db.insert(expense).values({ userId: user.id, ...parsed.data });
  refresh();
  return null;
}

export async function deleteExpense(id: string) {
  const user = await requireUser();
  await db.delete(expense).where(and(eq(expense.id, id), eq(expense.userId, user.id)));
  refresh();
}
