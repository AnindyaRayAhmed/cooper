export type AnswerValue = 0 | 1 | 2;
export type Answers = Record<string, AnswerValue>;
export interface CheckIn { id: string; date: string; answers: Answers; score: number; completedAt: string }
export interface CooperData { checkIns: CheckIn[] }
export interface Question { id: string; prompt: string; hint: string; options: { label: string; value: AnswerValue }[] }
export interface InsightsRequest {
  streak: number;
  carbonScore: number;
  highestImpactCategories: string[];
  dailyHabits: string[];
}
export interface InsightsResponse {
  recommendations: string[];
  motivation: string;
  goal: string;
  source: "gemini" | "fallback";
  error?: string;
}
