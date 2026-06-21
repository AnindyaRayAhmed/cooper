"use client";

import { useEffect, useMemo, useState } from "react";
import { useCooper } from "@/context/cooper-context";
import { buildFallbackInsights, summarizeCheckIn } from "@/lib/insights";
import type { InsightsResponse } from "@/types";

export function AiInsightsCard() {
  const { data, ready, streak } = useCooper();
  const latest = data.checkIns.at(-1);
  const summary = useMemo(() => summarizeCheckIn(latest, streak), [latest, streak]);
  const insightKey = `${ready}-${latest?.date ?? "empty"}-${latest?.score ?? "none"}-${streak}`;

  return (
    <section className="card lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">AI insights</p>
        <span className="rounded-full bg-[var(--sage-soft)] px-3 py-1 text-xs font-extrabold text-[var(--sage-deep)]">
          Reflection
        </span>
      </div>
      {!summary && ready ? (
        <>
          <h2 className="mt-4 font-serif text-3xl tracking-tight">
            Personal guidance is ready when you are
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Finish a check-in and Cooper will suggest a few calm, practical steps for tomorrow.
          </p>
        </>
      ) : (
        <InsightContent
          insightKey={insightKey}
          ready={ready}
          summary={summary ?? undefined}
        />
      )}
    </section>
  );
}

function InsightContent({
  insightKey,
  ready,
  summary,
}: {
  insightKey: string;
  ready: boolean;
  summary?: NonNullable<ReturnType<typeof summarizeCheckIn>>;
}) {
  if (!summary) {
    return (
      <div
        className="mt-5 rounded-[1.5rem] bg-[var(--surface-strong)] p-5"
        role="status"
        aria-label="Loading insights"
      >
        <div className="pulse-soft h-4 w-32 rounded-full bg-white/90" />
        <div className="pulse-soft mt-4 h-3 w-full rounded-full bg-white/90" />
        <div className="pulse-soft mt-3 h-3 w-4/5 rounded-full bg-white/90" />
        <p className="mt-5 text-sm font-bold text-[var(--muted)]">
          Shaping a few thoughtful suggestions...
        </p>
      </div>
    );
  }

  return <InsightBody key={insightKey} ready={ready} summary={summary} />;
}

function InsightBody({
  ready,
  summary,
}: {
  ready: boolean;
  summary: NonNullable<ReturnType<typeof summarizeCheckIn>>;
}) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);

  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(summary),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Insights request failed with ${response.status}.`);
        }

        const payload = (await response.json()) as InsightsResponse;
        setInsights(payload);
      } catch (error) {
        if (controller.signal.aborted) return;

        const message =
          error instanceof Error ? error.message : "Insights are unavailable right now.";
        setInsights(buildFallbackInsights(summary, message));
      } finally {
        if (!controller.signal.aborted) {
          setIsGenerating(false);
        }
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [ready, summary]);

  if (!ready || isGenerating) {
    return (
      <div
        className="mt-5 rounded-[1.5rem] bg-[var(--surface-strong)] p-5"
        role="status"
        aria-label="Loading insights"
      >
        <div className="pulse-soft h-4 w-32 rounded-full bg-white/90" />
        <div className="pulse-soft mt-4 h-3 w-full rounded-full bg-white/90" />
        <div className="pulse-soft mt-3 h-3 w-4/5 rounded-full bg-white/90" />
        <p className="mt-5 text-sm font-bold text-[var(--muted)]">
          Shaping a few thoughtful suggestions...
        </p>
      </div>
    );
  }

  if (!insights) {
    return (
      <>
        <h2 className="mt-4 font-serif text-3xl tracking-tight">
          Personal guidance is ready when you are
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Finish a check-in and Cooper will suggest a few calm, practical steps for tomorrow.
        </p>
      </>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      <div>
        <h2 className="font-serif text-3xl tracking-tight">Your next easiest win</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {insights.motivation}
        </p>
        {insights.source === "fallback" && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Using steady fallback guidance
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {insights.recommendations.map((recommendation) => (
          <div
            key={recommendation}
            className="rounded-[1.5rem] bg-[var(--surface-strong)] p-4 text-sm leading-6 text-[var(--charcoal)]"
          >
            {recommendation}
          </div>
        ))}
      </div>
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/70 p-4">
        <p className="eyebrow">Tomorrow&apos;s goal</p>
        <p className="mt-2 text-sm leading-6 text-[var(--charcoal)] sm:text-base">
          {insights.goal}
        </p>
      </div>
    </div>
  );
}
