"use client";

import { useCooper } from "@/context/cooper-context";
import { scoreLabel } from "@/lib/score";

export function CarbonScoreCard() {
  const { data, ready } = useCooper();
  const score = data.checkIns.at(-1)?.score ?? 0;

  return (
    <section className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Carbon score</p>
          {ready ? (
            <>
              <p className="mt-3 text-4xl font-black sm:text-5xl">
                {score}
                <span className="ml-1 text-lg font-bold text-[var(--muted)]">
                  /100
                </span>
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {data.checkIns.length
                  ? scoreLabel(score)
                  : "Complete your first check-in to create today's baseline."}
              </p>
            </>
          ) : (
            <div
              className="pulse-soft mt-4 h-20 rounded-3xl bg-[var(--surface-strong)]"
              role="status"
              aria-label="Loading carbon score"
            />
          )}
        </div>
        <div className="metric-ring flex h-24 w-24 items-center justify-center rounded-full">
          <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--sage-deep)]">
            steady
          </span>
        </div>
      </div>
    </section>
  );
}
