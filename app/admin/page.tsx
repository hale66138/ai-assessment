import { getAdminStats } from "@/lib/admin";
import { QUESTIONS } from "@/lib/questions";
import { DIMENSIONS } from "@/lib/scoring";
import { DIMENSION_META, formatScore } from "@/lib/results";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let stats: Awaited<ReturnType<typeof getAdminStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await getAdminStats();
  } catch (err) {
    error = err instanceof Error ? err.message : "读取统计数据失败";
  }

  if (error || !stats) {
    return (
      <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
        <div className="w-full max-w-3xl rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <p className="font-medium">无法加载统计数据</p>
          <p className="mt-1">{error}</p>
        </div>
      </main>
    );
  }

  const { completedCount, dimensionAverages, questionStats, cronbachAlphas } = stats;
  const lowSample = completedCount < 10;

  return (
    <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">管理后台 · 统计</h1>
          <LogoutButton />
        </div>

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">完成人数</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-black dark:text-zinc-50">
            {completedCount}
          </p>
          {lowSample && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              样本量有限（少于 10 人），以下统计仅供参考。
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">7 维平均分</h2>
          <ul className="mt-4 space-y-4">
            {DIMENSIONS.map((d) => {
              const avg = dimensionAverages[d];
              return (
                <li key={d}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-black dark:text-zinc-50">
                      {DIMENSION_META[d].label}
                    </span>
                    <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                      {avg === null ? "—" : formatScore(avg)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-black dark:bg-zinc-50"
                      style={{ width: `${avg === null ? 0 : (avg / 5) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">
            内部一致性（Cronbach α）
          </h2>
          <ul className="mt-4 divide-y divide-black/5 dark:divide-white/5">
            {DIMENSIONS.map((d) => {
              const alpha = cronbachAlphas[d];
              return (
                <li key={d} className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {DIMENSION_META[d].label}
                  </span>
                  <span className="text-sm tabular-nums text-black dark:text-zinc-50">
                    {alpha === null ? "样本不足，暂不计算" : alpha.toFixed(2)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            α 通常以 0.7 为可接受参考值。样本量 &lt; 10 时暂不计算；10–30 人时数值波动较大，仅供参考。
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">每题响应分布</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                  <th className="py-2 pr-3 font-medium">题目</th>
                  <th className="py-2 pr-3 font-medium">n</th>
                  <th className="py-2 pr-3 font-medium">均值</th>
                  <th className="py-2 font-medium">1–5 分布</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {QUESTIONS.map((q) => {
                  const s = questionStats[q.id];
                  const maxCount = Math.max(...s.counts, 1);
                  return (
                    <tr key={q.id} className="align-top">
                      <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-300">
                        <span className="mr-1 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                          {q.id}
                        </span>
                        {q.text}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-zinc-600 dark:text-zinc-300">
                        {s.n}
                      </td>
                      <td className="py-2 pr-3 tabular-nums text-zinc-600 dark:text-zinc-300">
                        {s.mean === null ? "—" : formatScore(s.mean)}
                      </td>
                      <td className="py-2">
                        <div className="flex items-end gap-1">
                          {s.counts.map((c, i) => (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                                {c}
                              </span>
                              <div
                                className="w-4 rounded-sm bg-black/20 dark:bg-white/20"
                                style={{ height: `${(c / maxCount) * 40}px` }}
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
