import type { CheckIn } from "@/types";

const day = (date: Date) => date.toISOString().slice(0, 10);
export function calculateStreak(checkIns: CheckIn[], now = new Date()) {
  const dates = new Set(checkIns.map((item) => item.date));
  const cursor = new Date(now);
  if (!dates.has(day(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(day(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
