"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { requireUser } from "@/lib/auth/session";
import { firstError, nameSchema, profileSchema, type FormState } from "@/lib/validation";

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db
    .insert(profile)
    .values({ userId: user.id, ...parsed.data })
    .onConflictDoUpdate({
      target: profile.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    });

  redirect("/");
}

export type SaveNameState = { error?: string; ok?: boolean } | null;

export async function saveName(_prev: SaveNameState, formData: FormData): Promise<SaveNameState> {
  await requireUser();
  const parsed = nameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { error } = await auth.updateUser({ name: parsed.data.name });
  if (error) return { error: "Não foi possível salvar o nome" };

  // O Neon Auth guarda os dados do usuário num cookie por até 5 min; apagá-lo faz a sessão ser lida de novo com o nome novo.
  (await cookies()).delete({ name: "__Secure-neon-auth.local.session_data", path: "/", secure: true });
  refresh();
  return { ok: true };
}
