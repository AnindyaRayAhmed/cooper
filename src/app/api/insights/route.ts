import { NextResponse } from "next/server";
import { buildFallbackInsights, parseInsightsText } from "@/lib/insights";
import type { InsightsRequest, InsightsResponse } from "@/types";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function isInsightsRequest(value: unknown): value is InsightsRequest {
  if (!value || typeof value !== "object") return false;

  const input = value as Partial<InsightsRequest>;
  
  const hasValidStreak =
    typeof input.streak === "number" &&
    Number.isInteger(input.streak) &&
    input.streak >= 0 &&
    input.streak <= 100000;

  const hasValidCarbonScore =
    typeof input.carbonScore === "number" &&
    input.carbonScore >= 0 &&
    input.carbonScore <= 100;

  const hasValidCategories =
    Array.isArray(input.highestImpactCategories) &&
    input.highestImpactCategories.length <= 10 &&
    input.highestImpactCategories.every(
      (item) => typeof item === "string" && item.length <= 100
    );

  const hasValidHabits =
    Array.isArray(input.dailyHabits) &&
    input.dailyHabits.length <= 30 &&
    input.dailyHabits.every(
      (item) => typeof item === "string" && item.length <= 200
    );

  return hasValidStreak && hasValidCarbonScore && hasValidCategories && hasValidHabits;
}

function sanitizeInsightsRequest(input: InsightsRequest): InsightsRequest {
  const sanitize = (str: string) =>
    str
      .replace(/<[^>]*>/g, "") // Strip simple HTML tags
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Strip control characters
      .trim();

  return {
    streak: input.streak,
    carbonScore: input.carbonScore,
    highestImpactCategories: input.highestImpactCategories.map(sanitize),
    dailyHabits: input.dailyHabits.map(sanitize),
  };
}

function promptForInsights(input: InsightsRequest) {
  return [
    "Return only JSON.",
    'Shape: {"recommendations":["","",""],"motivation":"","goal":""}',
    "Tone: calm, supportive, practical, concise, non-judgmental.",
    "Recommendations must be short, specific, and realistic for tomorrow.",
    `Streak: ${input.streak} day(s).`,
    `Carbon score: ${input.carbonScore}/100.`,
    `Highest impact categories: ${input.highestImpactCategories.join(", ")}.`,
    `Daily habits: ${input.dailyHabits.join("; ")}.`,
  ].join("\n");
}

function geminiPayload(input: InsightsRequest) {
  return {
    system_instruction: {
      parts: [
        {
          text:
            "You are Cooper, a calm sustainability habit coach. Give concise, supportive, practical advice. Avoid judgment, guilt, and technical jargon.",
        },
      ],
    },
    contents: [
      {
        parts: [{ text: promptForInsights(input) }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 220,
      thinkingConfig: {
        thinkingLevel: "low",
      },
    },
  };
}

function extractGeminiText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";

  const response = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

async function generateGeminiInsights(
  input: InsightsRequest,
  apiKey: string,
): Promise<InsightsResponse> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(geminiPayload(input)),
    cache: "no-store",
  });

  console.log(`[Gemini Debug] Gemini response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as unknown;
  const rawText = extractGeminiText(payload);
  const parsed = parseInsightsText(rawText);
  const parsingSuccess = !!parsed;
  console.log(`[Gemini Debug] Parsing success: ${parsingSuccess}`);

  if (!parsed) {
    throw new Error("Gemini returned an invalid insights payload.");
  }

  return { ...parsed, source: "gemini" };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!isInsightsRequest(body)) {
    return NextResponse.json(
      { error: "Insights payload is incomplete or invalid." },
      { status: 400 },
    );
  }

  const sanitizedBody = sanitizeInsightsRequest(body);
  const apiKey = process.env.GEMINI_API_KEY;
  const apiKeyExists = !!apiKey;
  console.log(`[Gemini Debug] API key exists: ${apiKeyExists}`);

  if (!apiKey) {
    console.warn("Configuration warning: GEMINI_API_KEY is not configured.");
    console.log("[Gemini Debug] Triggering fallback. Reason: GEMINI_API_KEY is not configured.");
    return NextResponse.json(
      buildFallbackInsights(
        sanitizedBody,
        "Gemini service is not configured. Local fallback guidance used."
      )
    );
  }

  try {
    const insights = await generateGeminiInsights(sanitizedBody, apiKey);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Gemini insights generation failed:", error);
    const rawErrorMsg = error instanceof Error ? error.message : String(error);
    const safeErrorMsg = apiKey ? rawErrorMsg.replace(new RegExp(apiKey, "g"), "[REDACTED_API_KEY]") : rawErrorMsg;
    console.log(`[Gemini Debug] Triggering fallback. Reason: ${safeErrorMsg}`);
    return NextResponse.json(
      buildFallbackInsights(
        sanitizedBody,
        "Gemini is unavailable right now. Local fallback guidance used."
      )
    );
  }
}
