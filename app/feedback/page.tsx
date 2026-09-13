"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getParticipantId } from "@/lib/session";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === null || submitting) return;

    const participantId = getParticipantId();
    if (!participantId) {
      alert("缺少参与者标识，请先完成测评。");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        participant_id: participantId,
        rating,
        comments: text.trim() || null,
      });
      if (error) throw error;
      alert("感谢反馈！");
      router.push("/");
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">反馈</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          你的反馈是匿名的，不会被关联到个人身份。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-black dark:text-zinc-50">
              整体满意度（1–5）
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <label
                  key={v}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                    rating === v
                      ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                      : "border-black/10 text-zinc-700 hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={v}
                    checked={rating === v}
                    onChange={() => setRating(v)}
                    className="sr-only"
                  />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="feedback-text"
              className="mb-2 block text-sm font-medium text-black dark:text-zinc-50"
            >
              其他想说的
            </label>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="可选，任何建议或想法"
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 text-sm text-black placeholder:text-zinc-400 focus:border-black focus:outline-none dark:border-white/10 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-50"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={rating === null || submitting}
              className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc]"
            >
              {submitting ? "提交中…" : "提交"}
            </button>
            <Link
              href="/results"
              className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
            >
              返回结果页
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
