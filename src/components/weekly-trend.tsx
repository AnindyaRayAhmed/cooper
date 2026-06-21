"use client";

import { useMemo } from "react";
import { useCooper } from "@/context/cooper-context";

const sampleScores = [42, 55, 49, 63, 68, 72, 76];

export function WeeklyTrend() {
  const { data, ready } = useCooper();
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() - (6 - i));

        const key = date.toISOString().slice(0, 10);
        const saved = data.checkIns.find((c) => c.date === key)?.score;

        return {
          key,
          label: date.toLocaleDateString("en-US", { weekday: "short" }),
          score: saved ?? (data.checkIns.length ? 0 : sampleScores[i]),
          sample: saved === undefined && !data.checkIns.length,
        };
      }),
    [data.checkIns],
  );

  return (
    <section className="card lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Weekly trend</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight">
            Your seven-day rhythm
          </h2>
        </div>
        {ready && !data.checkIns.length && (
          <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-bold text-[var(--muted)]">
            Preview data
          </span>
        )}
      </div>
      {ready ? (
        <div
          className="mt-6 rounded-[1.75rem] bg-[rgba(255,253,249,0.7)] p-4 sm:p-5"
          aria-label="Seven day sustainability score chart"
        >
          <div className="flex h-52 items-end gap-2 sm:gap-3" role="group" aria-label="Seven day score history chart">
            {days.map((day) => (
              <div
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center"
                key={day.key}
                role="group"
                aria-label={`${day.label}: score ${day.score || 0}${day.sample ? " (sample data)" : ""}`}
              >
                <span className="text-[10px] font-extrabold sm:text-xs" aria-hidden="true">
                  {day.score || "-"}
                </span>
                <div className="rounded-[1.25rem] bg-[var(--surface-strong)] px-1.5 pt-1.5" aria-hidden="true">
                  <div
                    className={`min-h-3 rounded-[1rem] transition-[height] duration-500 ${
                      day.sample ? "bg-[var(--sage)]/55" : "bg-[var(--sage-deep)]"
                    }`}
                    style={{ height: `${Math.max(day.score, 6)}%` }}
                  />
                </div>
                <span className="truncate text-[10px] text-[var(--muted)] sm:text-xs" aria-hidden="true">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
          {!data.checkIns.length && (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              A gentle example is shown until you start logging your own daily rhythm.
            </p>
          )}
        </div>
      ) : (
        <div
          className="pulse-soft mt-6 h-52 rounded-[1.75rem] bg-[var(--surface-strong)]"
          role="status"
          aria-label="Loading weekly trend"
        />
      )}
    </section>
  );
}
