"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { firstError, signUpSchema, type FormState } from "@/lib/validation";

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password, monthlyIncome, payday } = parsed.data;

  const { data, error } = await auth.signUp.email({ name, email, password });
  if (error || !data?.user) return { error: error?.message || "Não foi possível criar a conta" };

  await db.insert(profile).values({ userId: data.user.id, monthlyIncome, payday });

  redirect("/");
}
