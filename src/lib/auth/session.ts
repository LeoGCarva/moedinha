import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { auth } from "./server";

/** Usuário logado; redireciona para /login se não houver sessão. */
export async function requireUser() {
  await connection();
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function getProfile(userId: string) {
  const [row] = await db.select().from(profile).where(eq(profile.userId, userId));
  return row ?? null;
}
