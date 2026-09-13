"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setParticipantId } from "@/lib/session";

export default function ConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  function handleStart() {
    if (!agreed) return;
    setParticipantId(crypto.randomUUID());
    router.push("/assessment");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
      <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          AI 与人格测评
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          感谢你参与本次测评。问卷包含两部分——大五人格（BFI-44，44 题）与对 AI
          的总体态度（GAAIS，20 题），共 64 题，预计约需 10 分钟。
        </p>

        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              研究目的
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              帮助了解你的人格特质与对人工智能的态度，结果用于教育研究。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              匿名性
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              我们不会收集你的姓名、邮箱或 IP 地址。系统只会为你生成一个随机匿名编号。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              数据用途
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              你的回答将以匿名形式存储，仅用于聚合统计分析，不用于个体身份识别。
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-black dark:text-zinc-50">
              非临床声明
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              本测评结果仅供自我了解与教育探索，不构成任何临床或心理诊断，也不应被当作医疗建议。
            </p>
          </section>
        </div>

        <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-black dark:accent-zinc-50"
          />
          <span>我已阅读并理解以上内容，并同意参与本测评。</span>
        </label>

        <button
          type="button"
          onClick={handleStart}
          disabled={!agreed}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-black px-5 text-base font-medium text-white transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc]"
        >
          开始测评
        </button>
      </div>
    </main>
  );
}
