"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCooper } from "@/context/cooper-context";
import { questions } from "@/lib/questions";
import type { AnswerValue, Answers } from "@/types";

export function CheckInForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const { submit, ready } = useCooper();
  const router = useRouter();
  const question = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const choose = (value: AnswerValue) => {
    if (!ready) return;

    const next = { ...answers, [question.id]: value };
    setAnswers(next);

    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    submit(next);
    router.push("/dashboard");
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Daily check-in</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
            One small choice at a time.
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
          Ten daily moments, one clear snapshot. Your progress stays on this
          device for now.
        </p>
      </div>

      <section className="card soft-panel overflow-hidden p-5 sm:p-7">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm font-bold text-[var(--muted)]">
            <span>
              Question {step + 1} of {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--olive),var(--sage-deep))] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div key={question.id} className="fade-up">
          <p className="eyebrow sm:text-sm">{question.hint}</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {question.prompt}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Pick the option that feels closest to today.
          </p>

          <div className="mt-8 grid gap-3">
            {question.options.map((option) => (
              <button
                className="option-button"
                disabled={!ready}
                key={option.value}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="text-sm font-extrabold tracking-wide text-[var(--sage-deep)] transition hover:text-[var(--charcoal)] disabled:opacity-0"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Previous question
          </button>
          {!ready && (
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-[var(--muted)]">
              Getting your check-in ready...
            </span>
          )}
        </div>
      </section>
    </section>
  );
}
