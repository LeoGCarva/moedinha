"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { firstError, weeklyHoursSchema } from "@/lib/validation";

export type SaveHoursState = { error?: string; ok?: boolean } | null;

export async function saveWeeklyHours(_prev: SaveHoursState, formData: FormData): Promise<SaveHoursState> {
  const user = await requireUser();
  const parsed = weeklyHoursSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db
    .update(profile)
    .set({ weeklyHours: parsed.data.weeklyHours, updatedAt: new Date() })
    .where(eq(profile.userId, user.id));
  refresh();
  return { ok: true };
}
