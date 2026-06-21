import type { Answers } from "@/types";

export function calculateCarbonScore(answers: Answers, questionCount = 10) {
  const points = Object.values(answers).reduce<number>((sum, value) => sum + value, 0);
  return Math.round((points / (questionCount * 2)) * 100);
}

export function scoreLabel(score: number) {
  if (score >= 80) return "Planet positive";
  if (score >= 55) return "Building momentum";
  return "Room to grow";
}
