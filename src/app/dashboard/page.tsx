import Link from "next/link";
import { AiInsightsCard } from "@/components/ai-insights-card";
import { CarbonScoreCard } from "@/components/carbon-score-card";
import { StreakCard } from "@/components/streak-card";
import { WeeklyTrend } from "@/components/weekly-trend";

export default function Dashboard() {
  return (
    <main className="page-shell">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="fade-up mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Your progress</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              A steady view of your sustainability rhythm.
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)] sm:text-base">
              Watch your streak, score, and weekly pattern in one place, then
              return for another small check-in while the habit still feels light.
            </p>
          </div>
          <Link href="/check-in" className="button w-full sm:w-auto">
            Continue today&apos;s check-in
          </Link>
        </div>
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <StreakCard />
          <CarbonScoreCard />
          <WeeklyTrend />
          <AiInsightsCard />
        </div>
      </section>
    </main>
  );
}
