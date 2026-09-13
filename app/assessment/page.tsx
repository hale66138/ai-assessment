"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LIKERT_LABELS, QUESTIONS } from "@/lib/questions";
import { getParticipantId, setScores } from "@/lib/session";

export default function AssessmentPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 未完成同意页（无 participantId）则退回首页
  useEffect(() => {
    if (!getParticipantId()) {
      router.replace("/");
    }
  }, [router]);

  const total = QUESTIONS.length;
  const current = QUESTIONS[index];
  const selected = responses[current.id];
  const answeredCount = Object.keys(responses).length;
  const isLast = index === total - 1;

  function handleSelect(value: number) {
    setResponses((prev) => ({ ...prev, [current.id]: value }));
  }

  function handleNext() {
    if (selected === undefined) return;
    setIndex((i) => i + 1);
  }

  async function handleFinish() {
    if (submitting) return;
    const participantId = getParticipantId();
    if (!participantId) {
      setError("缺少参与者标识，请返回首页重新开始。");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, answers: responses }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : `提交失败（HTTP ${res.status}）`;
        throw new Error(message);
      }
      const scores = (data as { scores?: unknown } | null)?.scores;
      setScores(scores);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            第 {index + 1} / {total} 题
          </span>
          <span>已答 {answeredCount} 题</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-black transition-all dark:bg-zinc-50"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>

        <div className="mt-6">
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
            {current.scale === "BFI" ? "第一部分 · 人格问卷" : "第二部分 · AI 态度问卷"}
          </span>
        </div>

        <h1 className="mt-4 text-xl font-medium leading-8 text-black dark:text-zinc-50">
          {current.text}
        </h1>

        <div className="mt-6 space-y-2" role="radiogroup" aria-label="作答选项">
          {LIKERT_LABELS.map((label, i) => {
            const value = i + 1;
            const checked = selected === value;
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  checked
                    ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                    : "border-black/10 text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name="likert"
                  value={value}
                  checked={checked}
                  onChange={() => handleSelect(value)}
                  className="sr-only"
                />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {value}
                </span>
                {label}
              </label>
            );
          })}
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        {isLast && answeredCount < total && !error && (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            还有 {total - answeredCount} 题未作答，答满后才能提交。
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-black/10 px-5 text-base font-medium transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:hover:bg-white/5"
          >
            上一题
          </button>
          <button
            type="button"
            onClick={isLast ? handleFinish : handleNext}
            disabled={
              submitting || selected === undefined || (isLast && answeredCount < total)
            }
            className="flex h-12 flex-1 items-center justify-center rounded-full bg-black px-5 text-base font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc]"
          >
            {isLast ? (submitting ? "提交中…" : "完成") : "下一题"}
          </button>
        </div>
      </div>

      <div className="mt-6 w-full max-w-2xl">
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
          题目导航（点击可回看）
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUESTIONS.map((q, i) => {
            const answered = responses[q.id] !== undefined;
            const isCurrent = i === index;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`第 ${i + 1} 题`}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
                    : answered
                      ? "bg-zinc-300 text-black dark:bg-zinc-700 dark:text-zinc-100"
                      : "bg-black/5 text-zinc-400 dark:bg-white/10 dark:text-zinc-500"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
