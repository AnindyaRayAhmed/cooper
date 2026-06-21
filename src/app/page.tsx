import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell overflow-hidden">
      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
        <div className="fade-up relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm shadow-[0_10px_24px_rgba(45,49,43,0.05)]">
            <span className="pulse-soft h-2 w-2 rounded-full bg-[var(--olive)]" />
            <span className="eyebrow tracking-[0.14em]">A calmer daily ritual</span>
          </div>
          <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] text-[var(--charcoal)] sm:text-6xl lg:text-7xl">
            Small habits.
            <br />
            Steadier impact.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
            Cooper turns ten thoughtful daily choices into a clear carbon score,
            a visible streak, and calm next steps that feel easy to keep.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="button" href="/check-in">
              Begin today&apos;s check-in
            </Link>
            <Link className="button-secondary" href="/dashboard">
              See your progress
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["10 prompts", "A quick daily reflection"],
              ["2 minutes", "Light enough to return to tomorrow"],
              ["1 device", "Private progress on this device"],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/70 bg-white/55 p-4 backdrop-blur-sm"
              >
                <p className="text-sm font-extrabold text-[var(--sage-deep)]">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="fade-up lg:justify-self-end">
          <div className="card soft-panel relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--olive)]/50 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Today&apos;s snapshot</p>
                <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
                  Your habits add up.
                </h2>
              </div>
              <div className="metric-ring flex h-24 w-24 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(78,93,71,0.08)]">
                <span className="text-3xl font-black text-[var(--charcoal)]">72</span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)] sm:text-base">
              Check in in under two minutes. Cooper remembers your progress on
              this device and keeps the momentum visible without feeling heavy.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/75 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sage)]">
                  Streak energy
                </p>
                <p className="mt-2 text-2xl font-black">6 quiet wins</p>
              </div>
              <div className="rounded-3xl bg-white/75 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sage)]">
                  Focus today
                </p>
                <p className="mt-2 text-2xl font-black">Gentler travel</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
