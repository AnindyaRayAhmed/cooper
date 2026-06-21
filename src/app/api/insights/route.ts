import { NextResponse } from "next/server";
import { buildFallbackInsights, parseInsightsText } from "@/lib/insights";
import type { InsightsRequest, InsightsResponse } from "@/types";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function isInsightsRequest(value: unknown): value is InsightsRequest {
  if (!value || typeof value !== "object") return false;

  const input = value as Partial<InsightsRequest>;
  return (
    typeof input.streak === "number" &&
    typeof input.carbonScore === "number" &&
    Array.isArray(input.highestImpactCategories) &&
    Array.isArray(input.dailyHabits)
  );
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

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as unknown;
  const parsed = parseInsightsText(extractGeminiText(payload));

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
      { error: "Insights payload is incomplete." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(buildFallbackInsights(body, "GEMINI_API_KEY is not configured."));
  }

  try {
    const insights = await generateGeminiInsights(body, apiKey);
    return NextResponse.json(insights);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gemini is unavailable right now.";
    return NextResponse.json(buildFallbackInsights(body, message));
  }
}
