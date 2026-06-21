import { questions } from "@/lib/questions";
import type { CheckIn, InsightsRequest, InsightsResponse } from "@/types";

const answerLabels = ["not today", "a little", "yes"] as const;

export function summarizeCheckIn(
  checkIn: CheckIn | undefined,
  streak: number,
): InsightsRequest | null {
  if (!checkIn) return null;

  const ranked = questions
    .map((question) => ({
      id: question.id,
      hint: question.hint,
      prompt: question.prompt,
      value: checkIn.answers[question.id] ?? 0,
    }))
    .sort((left, right) => left.value - right.value);

  return {
    streak,
    carbonScore: checkIn.score,
    highestImpactCategories: ranked.slice(0, 3).map((item) => item.hint),
    dailyHabits: questions.map((question) => {
      const value = checkIn.answers[question.id] ?? 0;
      return `${question.hint}: ${answerLabels[value]}`;
    }),
  };
}

export function buildFallbackInsights(
  input: InsightsRequest | null,
  error?: string,
): InsightsResponse {
  const categories = input?.highestImpactCategories ?? [
    "Low-carbon travel",
    "Food choices",
    "Home energy",
  ];

  const recommendations = [
    `Choose one small improvement in ${categories[0].toLowerCase()} and repeat it tomorrow.`,
    `Pair a habit you already do well with a lighter step in ${categories[1].toLowerCase()}.`,
    `Keep tomorrow simple by planning one action for ${categories[2].toLowerCase()} before the day starts.`,
  ];

  const motivation =
    (input?.streak ?? 0) > 0
      ? `A ${input?.streak}-day streak is real progress. Quiet consistency is working.`
      : "A small start still counts. One thoughtful day is enough to build from.";

  const goal =
    input && input.carbonScore >= 70
      ? `Keep your score above ${Math.max(70, input.carbonScore - 5)} with one repeatable habit.`
      : "Aim for one extra sustainable choice tomorrow that feels easy to keep.";

  return {
    recommendations,
    motivation,
    goal,
    source: "fallback",
    error,
  };
}

export function parseInsightsText(text: string): Omit<InsightsResponse, "source" | "error"> | null {
  const normalized = text.trim();

  // Find the outer JSON boundaries to isolate JSON from any conversational preambles/fences
  const jsonStart = normalized.indexOf("{");
  const jsonEnd = normalized.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return null;
  }

  const jsonCandidate = normalized.slice(jsonStart, jsonEnd + 1);

  try {
    // Strip trailing commas before brackets/braces to prevent JSON.parse failures
    const cleanedJson = jsonCandidate.replace(/,\s*([\]}])/g, "$1");
    const parsed = JSON.parse(cleanedJson) as Partial<InsightsResponse>;
    
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .slice(0, 3)
      : [];

    if (
      recommendations.length !== 3 ||
      typeof parsed.motivation !== "string" ||
      typeof parsed.goal !== "string"
    ) {
      return null;
    }

    return {
      recommendations,
      motivation: parsed.motivation.trim(),
      goal: parsed.goal.trim(),
    };
  } catch {
    return null;
  }
}
