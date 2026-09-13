"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Radar } from "react-chartjs-2";
import { getParticipantId, getScores } from "@/lib/session";
import { DIMENSIONS } from "@/lib/scoring";
import { DIMENSION_META, explainDimension, formatScore, relativeLevel } from "@/lib/results";
import type { Dimension } from "@/lib/supabase";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const BIG_FIVE: Dimension[] = ["O", "C", "E", "A", "N"];
const AI_DIMS: Dimension[] = ["AI_POS", "AI_NEG"];
const SCORES_KEY = "scores";

function isValidScores(value: unknown): value is Record<Dimension, number> {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return DIMENSIONS.every(
    (d) => typeof record[d] === "number" && Number.isFinite(record[d] as number),
  );
}

// 会话数据本页只读一次，无需订阅变更；返回原始字符串保证快照按值比较稳定。
function subscribeToScores() {
  return () => {};
}

function getScoresSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SCORES_KEY);
}

function getScoresServerSnapshot(): null {
  return null;
}

function subscribeToDark(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getDarkSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getDarkServerSnapshot(): boolean {
  return false;
}

export default function ResultsPage() {
  const router = useRouter();

  // 无 participantId 或无效 scores 时退回首页（不 setState，仅导航）
  useEffect(() => {
    const pid = getParticipantId();
    const stored = getScores<unknown>();
    if (!pid || !isValidScores(stored)) {
      router.replace("/");
    }
  }, [router]);

  const rawScores = useSyncExternalStore(
    subscribeToScores,
    getScoresSnapshot,
    getScoresServerSnapshot,
  );
  const isDark = useSyncExternalStore(subscribeToDark, getDarkSnapshot, getDarkServerSnapshot);

  const scores = useMemo<Record<Dimension, number> | null>(() => {
    if (rawScores === null) return null;
    try {
      const parsed: unknown = JSON.parse(rawScores);
      return isValidScores(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [rawScores]);

  if (!scores) {
    return (
      <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">加载中…</p>
      </main>
    );
  }

  const accent = isDark ? "rgb(237, 237, 237)" : "rgb(0, 0, 0)";
  const fill = isDark ? "rgba(237, 237, 237, 0.15)" : "rgba(0, 0, 0, 0.08)";
  const gridColor = isDark ? "rgba(237, 237, 237, 0.2)" : "rgba(0, 0, 0, 0.1)";
  const labelColor = isDark ? "rgb(237, 237, 237)" : "rgb(23, 23, 23)";

  const radarData: ChartData<"radar"> = {
    labels: BIG_FIVE.map((d) => DIMENSION_META[d].label),
    datasets: [
      {
        label: "得分",
        data: BIG_FIVE.map((d) => scores[d]),
        backgroundColor: fill,
        borderColor: accent,
        borderWidth: 2,
        pointBackgroundColor: accent,
        pointBorderColor: accent,
      },
    ],
  };

  const radarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 1,
        max: 5,
        ticks: { stepSize: 1, color: labelColor, backdropColor: "transparent" },
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        pointLabels: { color: labelColor, font: { size: 13 } },
      },
    },
    plugins: { legend: { display: false } },
  };

  // 维度间比较（仅大五）：找最高/最低维度，中性陈述，不做价值判断
  let highestDim: Dimension = BIG_FIVE[0];
  let lowestDim: Dimension = BIG_FIVE[0];
  for (const d of BIG_FIVE) {
    if (scores[d] > scores[highestDim]) highestDim = d;
    if (scores[d] < scores[lowestDim]) lowestDim = d;
  }
  const dimGap = scores[highestDim] - scores[lowestDim];

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">你的测评结果</h1>

        {/* 大五人格 */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">大五人格</h2>
          <div className="mt-4 h-72">
            <Radar data={radarData} options={radarOptions} />
          </div>
          <ul className="mt-6 divide-y divide-black/5 dark:divide-white/5">
            {BIG_FIVE.map((d) => {
              const meta = DIMENSION_META[d];
              const level = relativeLevel(scores[d]);
              return (
                <li key={d} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-black dark:text-zinc-50">{meta.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{meta.description}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      你的分数{level}，表示{explainDimension(d, level)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-lg font-semibold tabular-nums text-black dark:text-zinc-50">
                      {formatScore(scores[d])}
                    </span>
                    <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                      {level}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 维度间比较（仅大五） */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">维度间比较</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            你的{DIMENSION_META[highestDim].label}（{formatScore(scores[highestDim])}）最高，{DIMENSION_META[lowestDim].label}（{formatScore(scores[lowestDim])}）最低，两者相差 {formatScore(dimGap)} 分。
          </p>
        </section>

        {/* AI 态度 */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">对 AI 的态度</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            本测评中，AI 积极态度和 AI 负面担忧两个维度都做了方向统一，分数越高代表对 AI 的整体态度越积极。
          </p>
          <ul className="mt-5 space-y-5">
            {AI_DIMS.map((d) => {
              const meta = DIMENSION_META[d];
              const level = relativeLevel(scores[d]);
              return (
                <li key={d}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black dark:text-zinc-50">{meta.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{meta.description}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        你的分数{level}，表示{explainDimension(d, level)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-lg font-semibold tabular-nums text-black dark:text-zinc-50">
                        {formatScore(scores[d])}
                      </span>
                      <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {level}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-black dark:bg-zinc-50"
                      style={{ width: `${(scores[d] / 5) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 免责声明 */}
        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 text-sm leading-6 text-zinc-600 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300">
          <p className="font-medium text-black dark:text-zinc-50">免责声明</p>
          <p className="mt-1">本结果仅供教育参考，不构成心理评估或医疗建议。</p>
          <p>本测评不用于临床诊断，也不做任何因果推断。</p>
        </section>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/feedback"
            className="flex h-12 items-center justify-center rounded-full bg-black px-6 text-base font-medium text-white transition-colors hover:bg-[#383838] dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc]"
          >
            填写反馈
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
