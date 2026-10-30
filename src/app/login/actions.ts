"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import type { FormState } from "@/lib/validation";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message || "Email ou senha inválidos" };

  redirect("/");
}
