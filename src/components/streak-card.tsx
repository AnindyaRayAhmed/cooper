"use client";

import { useCooper } from "@/context/cooper-context";

export function StreakCard() {
  const { streak, ready } = useCooper();

  return (
    <section className="card soft-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Daily streak</p>
          {ready ? (
            <>
              <p className="mt-3 font-serif text-5xl leading-none tracking-tight sm:text-6xl">
                {streak}
              </p>
              <p className="mt-2 text-lg font-extrabold text-[var(--sage-deep)]">
                {streak === 1 ? "day of steady care" : "days of steady care"}
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                {streak
                  ? "A small streak is still a real streak. You are building something durable."
                  : "Your first check-in starts the streak and gives Cooper a gentle starting point."}
              </p>
            </>
          ) : (
            <div
              className="pulse-soft mt-4 h-24 rounded-3xl bg-white/80"
              aria-label="Loading streak"
            />
          )}
        </div>
        <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.75rem] bg-white/80 p-4 text-3xl shadow-[inset_0_0_0_1px_rgba(78,93,71,0.08)] sm:h-24 sm:w-24">
          <span aria-hidden="true">*</span>
        </div>
      </div>
    </section>
  );
}
