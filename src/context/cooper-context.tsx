"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storageService } from "@/services/storage";
import { calculateCarbonScore } from "@/lib/score";
import { calculateStreak } from "@/lib/streak";
import type { Answers, CheckIn, CooperData } from "@/types";

type Value = { data: CooperData; ready: boolean; streak: number; submit: (answers: Answers) => CheckIn };
const Context = createContext<Value | null>(null);
export function CooperProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CooperData>({ checkIns: [] });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => { setData(storageService.load()); setReady(true); }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (ready) storageService.save(data); }, [data, ready]);
  const value = useMemo<Value>(() => ({ data, ready, streak: calculateStreak(data.checkIns), submit(answers) {
    const date = new Date().toISOString().slice(0, 10);
    const checkIn: CheckIn = { id: crypto.randomUUID(), date, answers, score: calculateCarbonScore(answers), completedAt: new Date().toISOString() };
    setData((current) => ({ checkIns: [...current.checkIns.filter((item) => item.date !== date), checkIn] }));
    return checkIn;
  } }), [data, ready]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCooper() { const value = useContext(Context); if (!value) throw new Error("useCooper must be used inside CooperProvider"); return value; }
