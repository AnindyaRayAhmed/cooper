import type { CooperData } from "@/types";

const KEY = "cooper-data-v1";
const empty = (): CooperData => ({ checkIns: [] });
export const storageService = {
  load(): CooperData {
    if (typeof window === "undefined") return empty();
    try {
      const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
      return { checkIns: Array.isArray(parsed.checkIns) ? parsed.checkIns : [] };
    } catch { return empty(); }
  },
  save(data: CooperData) { if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(data)); },
};
