import type { CooperData, CheckIn } from "@/types";

const KEY = "cooper-data-v1";
const empty = (): CooperData => ({ checkIns: [] });

function isValidCheckIn(item: unknown): item is CheckIn {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Record<string, unknown>;
  
  const answers = candidate.answers;
  if (!answers || typeof answers !== "object") return false;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.date === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.completedAt === "string" &&
    Object.values(answers as Record<string, unknown>).every(
      (v) => v === 0 || v === 1 || v === 2
    )
  );
}

export const storageService = {
  load(): CooperData {
    if (typeof window === "undefined") return empty();
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return empty();
      const parsed = JSON.parse(raw);
      const checkIns = Array.isArray(parsed.checkIns)
        ? parsed.checkIns.filter(isValidCheckIn)
        : [];
      return { checkIns };
    } catch {
      return empty();
    }
  },
  save(data: CooperData) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    }
  },
};
